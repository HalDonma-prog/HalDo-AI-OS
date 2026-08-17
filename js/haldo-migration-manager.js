/*
 * ============================================================
 * HALDO AI OS 20
 * HALDO MIGRATION MANAGER
 * ============================================================
 *
 * Verantwortlich für:
 * - Datenbank-/Storage-Migrationen
 * - Versionsübergänge
 * - Schema-Versionierung
 * - Migration vor Updates
 * - Migration nach Updates
 * - sichere Migration
 * - Wiederholbarkeit
 * - Fehlerbehandlung
 *
 * Architektur:
 *
 * Update Manager
 *       ↓
 * Migration Manager
 *       ↓
 * Schema / Storage / Apps
 *       ↓
 * neue HalDo-Version
 *
 * ============================================================
 */

(function (window) {

    "use strict";


    const HalDoOS =
        window.HalDoOS =
        window.HalDoOS || {};


    const MigrationManager = {

        name:
            "HalDo Migration Manager",

        version:
            "20.0.0",

        initialized:
            false,

        state:
            "idle",

        currentVersion:
            "20.0.0",

        targetVersion:
            null,

        events:
            {},

        migrations:
            {},

        migrationHistory:
            [],

        activeMigration:
            null,

        lastMigration:
            null,

        lastError:
            null,

        storageKey:
            "haldo-ai-os-migration-v20"

    };


    /* ========================================================
     * EVENT SYSTEM
     * ======================================================== */

    MigrationManager.on =
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
                !MigrationManager
                    .events[
                        eventName
                    ]
            ) {

                MigrationManager
                    .events[
                        eventName
                    ] = [];

            }


            MigrationManager
                .events[
                    eventName
                ]
                .push(
                    callback
                );


            return function unsubscribe() {

                const listeners =
                    MigrationManager
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


    MigrationManager.emit =
        function (
            eventName,
            payload
        ) {

            const listeners =
                MigrationManager
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
                            "[HalDo Migration Manager]",
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
                    "[HalDo Migration Manager] Event Bridge:",
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

                /* Fallback für ältere Browser */

            }

        };


    /* ========================================================
     * STATE
     * ======================================================== */

    MigrationManager.setState =
        function (
            state
        ) {

            MigrationManager.state =
                state;


            MigrationManager.emit(
                "migration:state",
                MigrationManager
                    .getStatus()
            );


            return state;

        };


    MigrationManager.getStatus =
        function () {

            return {

                state:
                    MigrationManager.state,

                initialized:
                    MigrationManager.initialized,

                currentVersion:
                    MigrationManager
                        .currentVersion,

                targetVersion:
                    MigrationManager
                        .targetVersion,

                activeMigration:
                    MigrationManager
                        .activeMigration,

                lastMigration:
                    MigrationManager
                        .lastMigration,

                lastError:
                    MigrationManager
                        .lastError,

                historyLength:
                    MigrationManager
                        .migrationHistory
                        .length

            };

        };


    /* ========================================================
     * VERSION COMPARISON
     * ======================================================== */

    MigrationManager.compareVersions =
        function (
            a,
            b
        ) {

            function parse(
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

            }


            const av =
                parse(a);

            const bv =
                parse(b);


            while (
                av.length <
                3
            ) {

                av.push(0);

            }


            while (
                bv.length <
                3
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


    /* ========================================================
     * MIGRATION REGISTRATION
     * ======================================================== */

    MigrationManager.register =
        function (
            fromVersion,
            toVersion,
            handler,
            options
        ) {

            if (
                typeof handler !==
                "function"
            ) {

                throw new TypeError(
                    "Migration handler muss eine Funktion sein."
                );

            }


            const key =
                String(
                    fromVersion
                ) +
                "->" +
                String(
                    toVersion
                );


            MigrationManager
                .migrations[
                    key
                ] = {

                    from:
                        String(
                            fromVersion
                        ),

                    to:
                        String(
                            toVersion
                        ),

                    handler:
                        handler,

                    description:
                        options &&
                        options.description
                            ? options.description
                            : "",

                    critical:
                        options &&
                        options.critical === true,

                    registeredAt:
                        new Date()
                            .toISOString()

                };


            MigrationManager.emit(
                "migration:registered",
                MigrationManager
                    .migrations[
                        key
                    ]
            );


            return key;

        };


    /* ========================================================
     * FIND MIGRATION
     * ======================================================== */

    MigrationManager.findMigration =
        function (
            fromVersion,
            toVersion
        ) {

            const key =
                String(
                    fromVersion
                ) +
                "->" +
                String(
                    toVersion
                );


            return (
                MigrationManager
                    .migrations[
                        key
                    ] ||
                null
            );

        };


    /* ========================================================
     * FIND MIGRATION PATH
     * ======================================================== */

    MigrationManager.findMigrationPath =
        function (
            fromVersion,
            toVersion
        ) {

            if (
                MigrationManager
                    .compareVersions(
                        fromVersion,
                        toVersion
                    ) === 0
            ) {

                return [];

            }


            const direct =
                MigrationManager
                    .findMigration(
                        fromVersion,
                        toVersion
                    );


            if (direct) {

                return [
                    direct
                ];

            }


            /*
             * Suche nach einer Kette:
             *
             * 20.0.0 -> 20.1.0
             * 20.1.0 -> 20.2.0
             * 20.2.0 -> 21.0.0
             */

            const visited =
                new Set();


            const queue = [
                {
                    version:
                        fromVersion,

                    path:
                        []
                }
            ];


            while (
                queue.length
            ) {

                const current =
                    queue.shift();


                if (
                    visited.has(
                        current.version
                    )
                ) {

                    continue;

                }


                visited.add(
                    current.version
                );


                const migrations =
                    Object.values(
                        MigrationManager
                            .migrations
                    );


                for (
                    const migration
                    of migrations
                ) {

                    if (
                        migration.from !==
                        current.version
                    ) {

                        continue;

                    }


                    const newPath =
                        current.path.concat(
                            migration
                        );


                    if (
                        migration.to ===
                        String(
                            toVersion
                        )
                    ) {

                        return newPath;

                    }


                    if (
                        MigrationManager
                            .compareVersions(
                                migration.to,
                                toVersion
                            ) <=
                        0
                    ) {

                        queue.push(
                            {
                                version:
                                    migration.to,

                                path:
                                    newPath
                            }
                        );

                    }

                }

            }


            return null;

        };


    /* ========================================================
     * PREPARE
     * ======================================================== */

    MigrationManager.prepare =
        async function (
            options
        ) {

            options =
                options || {};


            const from =
                String(
                    options.from ||
                    MigrationManager
                        .currentVersion
                );


            const to =
                String(
                    options.to ||
                    MigrationManager
                        .targetVersion ||
                    from
                );


            MigrationManager.currentVersion =
                from;

            MigrationManager.targetVersion =
                to;


            MigrationManager.lastError =
                null;


            MigrationManager.setState(
                "preparing"
            );


            if (
                MigrationManager
                    .compareVersions(
                        from,
                        to
                    ) === 0
            ) {

                MigrationManager.setState(
                    "not-required"
                );


                return {

                    success:
                        true,

                    required:
                        false,

                    from:
                        from,

                    to:
                        to,

                    path:
                        []

                };

            }


            const path =
                MigrationManager
                    .findMigrationPath(
                        from,
                        to
                    );


            /*
             * Wenn noch kein spezifischer
             * Migrationsschritt existiert,
             * wird KEINE Änderung vorgenommen.
             */

            if (!path) {

                MigrationManager.setState(
                    "awaiting-migration"
                );


                return {

                    success:
                        true,

                    required:
                        true,

                    ready:
                        false,

                    from:
                        from,

                    to:
                        to,

                    path:
                        [],

                    message:
                        "Noch kein Migrationspfad registriert."

                };

            }


            MigrationManager.activeMigration =
                {

                    from:
                        from,

                    to:
                        to,

                    path:
                        path.map(
                            function (
                                migration
                            ) {

                                return {

                                    from:
                                        migration.from,

                                    to:
                                        migration.to,

                                    description:
                                        migration.description,

                                    critical:
                                        migration.critical

                                };

                            }
                        )

                };


            MigrationManager.setState(
                "prepared"
            );


            MigrationManager.emit(
                "migration:prepared",
                MigrationManager
                    .activeMigration
            );


            return {

                success:
                    true,

                required:
                    true,

                ready:
                    true,

                from:
                    from,

                to:
                    to,

                path:
                    path

            };

        };


    /* ========================================================
     * SNAPSHOT
     * ======================================================== */

    MigrationManager.createSnapshot =
        async function () {

            try {

                const backupManager =
                    window.HalDoBackupManager ||
                    HalDoOS.backupManager;


                if (
                    backupManager &&
                    typeof backupManager
                        .createBackup ===
                    "function"
                ) {

                    return await backupManager
                        .createBackup(
                            {
                                reason:
                                    "before-migration",

                                version:
                                    MigrationManager
                                        .currentVersion
                            }
                        );

                }


                return {

                    success:
                        true,

                    mode:
                        "backup-manager-pending"

                };

            } catch (error) {

                return {

                    success:
                        false,

                    error:
                        error.message

                };

            }

        };


    /* ========================================================
     * EXECUTE
     * ======================================================== */

    MigrationManager.execute =
        async function (
            options
        ) {

            options =
                options || {};


            if (
                MigrationManager.state ===
                "running"
            ) {

                return {

                    success:
                        false,

                    reason:
                        "migration-running"

                };

            }


            const from =
                String(
                    options.from ||
                    MigrationManager
                        .currentVersion
                );


            const to =
                String(
                    options.to ||
                    MigrationManager
                        .targetVersion
                );


            const path =
                MigrationManager
                    .findMigrationPath(
                        from,
                        to
                    );


            if (!path) {

                MigrationManager.setState(
                    "awaiting-migration"
                );


                return {

                    success:
                        false,

                    reason:
                        "migration-path-not-found",

                    from:
                        from,

                    to:
                        to

                };

            }


            if (
                options.confirmed !== true
            ) {

                MigrationManager.emit(
                    "migration:confirmation-required",
                    {
                        from:
                            from,

                        to:
                            to,

                        path:
                            path
                    }
                );


                return {

                    success:
                        false,

                    reason:
                        "confirmation-required"

                };

            }


            MigrationManager.setState(
                "running"
            );


            MigrationManager.lastError =
                null;


            const snapshot =
                await MigrationManager
                    .createSnapshot();


            if (
                !snapshot.success
            ) {

                MigrationManager.lastError =
                    snapshot.error;


                MigrationManager.setState(
                    "error"
                );


                return {

                    success:
                        false,

                    reason:
                        "snapshot-failed",

                    error:
                        snapshot.error

                };

            }


            const startedAt =
                new Date()
                    .toISOString();


            const results = [];


            try {

                for (
                    let index = 0;
                    index < path.length;
                    index++
                ) {

                    const migration =
                        path[index];


                    MigrationManager.emit(
                        "migration:step-start",
                        {
                            index:
                                index,

                            total:
                                path.length,

                            from:
                                migration.from,

                            to:
                                migration.to
                        }
                    );


                    const result =
                        await migration
                            .handler(
                                {
                                    from:
                                        migration.from,

                                    to:
                                        migration.to,

                                    manifest:
                                        options.manifest ||
                                        null,

                                    index:
                                        index,

                                    total:
                                        path.length,

                                    manager:
                                        MigrationManager
                                }
                            );


                    results.push(
                        {
                            from:
                                migration.from,

                            to:
                                migration.to,

                            success:
                                result !== false,

                            result:
                                result

                        }
                    );


                    if (
                        result === false
                    ) {

                        throw new Error(
                            "Migration " +
                            migration.from +
                            " -> " +
                            migration.to +
                            " wurde abgebrochen."
                        );

                    }


                    MigrationManager.emit(
                        "migration:step-complete",
                        {
                            index:
                                index,

                            total:
                                path.length,

                            from:
                                migration.from,

                            to:
                                migration.to
                        }
                    );

                }


                const record =
                    {

                        from:
                            from,

                        to:
                            to,

                        startedAt:
                            startedAt,

                        completedAt:
                            new Date()
                                .toISOString(),

                        success:
                            true,

                        steps:
                            results

                    };


                MigrationManager
                    .migrationHistory
                    .push(
                        record
                    );


                MigrationManager
                    .saveHistory();


                MigrationManager.lastMigration =
                    record;


                MigrationManager.currentVersion =
                    to;

                MigrationManager.targetVersion =
                    null;

                MigrationManager.activeMigration =
                    null;


                MigrationManager.setState(
                    "complete"
                );


                MigrationManager.emit(
                    "migration:complete",
                    record
                );


                return {

                    success:
                        true,

                    record:
                        record

                };

            } catch (error) {

                MigrationManager.lastError =
                    error.message;


                MigrationManager.setState(
                    "error"
                );


                MigrationManager.emit(
                    "migration:error",
                    {
                        from:
                            from,

                        to:
                            to,

                        error:
                            error.message,

                        results:
                            results
                    }
                );


                return {

                    success:
                        false,

                    error:
                        error.message,

                    results:
                        results

                };

            }

        };


    /* ========================================================
     * ACTIVATE
     * ======================================================== */

    MigrationManager.activate =
        async function (
            options
        ) {

            options =
                options || {};


            const from =
                String(
                    options.from ||
                    MigrationManager
                        .currentVersion
                );


            const to =
                String(
                    options.to ||
                    MigrationManager
                        .targetVersion ||
                    from
                );


            if (
                MigrationManager
                    .compareVersions(
                        from,
                        to
                    ) === 0
            ) {

                return {

                    success:
                        true,

                    required:
                        false

                };

            }


            /*
             * Wenn keine Migration registriert
             * ist, wird nichts gefährlich
             * verändert.
             */

            const path =
                MigrationManager
                    .findMigrationPath(
                        from,
                        to
                    );


            if (!path) {

                return {

                    success:
                        true,

                    required:
                        true,

                    migrated:
                        false,

                    reason:
                        "migration-pending",

                    from:
                        from,

                    to:
                        to

                };

            }


            return MigrationManager
                .execute(
                    {
                        from:
                            from,

                        to:
                            to,

                        manifest:
                            options.manifest,

                        confirmed:
                            options.confirmed === true
                    }
                );

        };


    /* ========================================================
     * HISTORY
     * ======================================================== */

    MigrationManager.saveHistory =
        function () {

            try {

                localStorage.setItem(
                    MigrationManager
                        .storageKey,

                    JSON.stringify(
                        MigrationManager
                            .migrationHistory
                    )
                );


                return true;

            } catch (error) {

                MigrationManager.lastError =
                    error.message;

                return false;

            }

        };


    MigrationManager.loadHistory =
        function () {

            try {

                const raw =
                    localStorage.getItem(
                        MigrationManager
                            .storageKey
                    );


                if (!raw) {

                    MigrationManager
                        .migrationHistory =
                        [];

                    return [];

                }


                const parsed =
                    JSON.parse(
                        raw
                    );


                MigrationManager
                    .migrationHistory =
                    Array.isArray(parsed)
                        ? parsed
                        : [];


                return MigrationManager
                    .migrationHistory;

            } catch (error) {

                MigrationManager
                    .migrationHistory =
                    [];

                MigrationManager.lastError =
                    error.message;

                return [];

            }

        };


    MigrationManager.getHistory =
        function () {

            return MigrationManager
                .migrationHistory
                .slice();

        };


    /* ========================================================
     * REGISTER INITIAL V20 MIGRATION
     * ========================================================
     *
     * Diese Migration ist bewusst minimal.
     * Sie dient dazu, das Fundament von V20
     * als eigenes Schema zu registrieren.
     */

    MigrationManager.register(
        "20.0.0",
        "20.0.1",
        async function (context) {

            /*
             * Platz für den ersten echten
             * Daten-Schema-Schritt.
             *
             * Noch keine bestehenden Benutzerdaten
             * werden verändert.
             */

            return {

                success:
                    true,

                mode:
                    "schema-preparation",

                from:
                    context.from,

                to:
                    context.to

            };

        },
        {
            description:
                "Vorbereitung des HalDo AI OS V20 Daten-Schemas.",

            critical:
                false

        }
    );


    /* ========================================================
     * INIT
     * ======================================================== */

    MigrationManager.init =
        function () {

            if (
                MigrationManager.initialized
            ) {

                return MigrationManager;

            }


            MigrationManager
                .loadHistory();


            MigrationManager.initialized =
                true;


            MigrationManager.setState(
                "ready"
            );


            MigrationManager.emit(
                "migration:manager-ready",
                MigrationManager
                    .getStatus()
            );


            return MigrationManager;

        };


    /* ========================================================
     * GLOBAL REGISTRATION
     * ======================================================== */

    window.HalDoMigrationManager =
        MigrationManager;

    window.HalDoV20MigrationManager =
        MigrationManager;

    HalDoOS.migrationManager =
        MigrationManager;


    /* ========================================================
     * BOOT
     * ======================================================== */

    function boot() {

        MigrationManager.init();

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