/*
 * ============================================================
 * HALDO AI OS 20
 * HALDO BACKUP MANAGER
 * ============================================================
 *
 * Verantwortlich für:
 * - System-Backups
 * - App-Daten-Backups
 * - Storage-Backups
 * - Backup-Metadaten
 * - Wiederherstellungspunkte
 * - Update-Sicherung
 * - Backup-Verwaltung
 *
 * Architektur:
 *
 * Update Manager
 *       ↓
 * Backup Manager
 *       ↓
 * Storage / IndexedDB / LocalStorage
 *       ↓
 * Migration / Rollback
 *
 * ============================================================
 */

(function (window) {

    "use strict";

    const HalDoOS =
        window.HalDoOS =
        window.HalDoOS || {};

    const BackupManager = {

        name: "HalDo Backup Manager",

        version: "20.0.0",

        initialized: false,

        state: "idle",

        maxBackups: 10,

        backups: [],

        events: {},

        storageKey:
            "haldo-ai-os-backup-index-v20",

        backupPrefix:
            "haldo-ai-os-backup-v20-",

        currentOperation: null,

        lastBackup: null,

        lastRestore: null,

        lastError: null

    };


    /* ========================================================
     * EVENTS
     * ======================================================== */

    BackupManager.on = function (eventName, callback) {

        if (typeof callback !== "function") {
            return function () {};
        }

        if (!BackupManager.events[eventName]) {
            BackupManager.events[eventName] = [];
        }

        BackupManager.events[eventName].push(callback);

        return function unsubscribe() {

            const listeners =
                BackupManager.events[eventName];

            if (!listeners) {
                return;
            }

            const index =
                listeners.indexOf(callback);

            if (index !== -1) {
                listeners.splice(index, 1);
            }

        };

    };


    BackupManager.emit = function (
        eventName,
        payload
    ) {

        const listeners =
            BackupManager.events[eventName] || [];

        listeners.forEach(function (callback) {

            try {
                callback(payload);
            } catch (error) {
                console.error(
                    "[HalDo Backup Manager]",
                    error
                );
            }

        });


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

        } catch (error) {

            console.warn(
                "[HalDo Backup Manager] Event Bridge:",
                error
            );

        }


        try {

            window.dispatchEvent(
                new CustomEvent(
                    eventName,
                    {
                        detail: payload
                    }
                )
            );

        } catch (error) {
            /* Browser ohne CustomEvent-Unterstützung */
        }

    };


    /* ========================================================
     * STATE
     * ======================================================== */

    BackupManager.setState = function (state) {

        BackupManager.state = state;

        BackupManager.emit(
            "backup:state",
            BackupManager.getStatus()
        );

        return state;

    };


    BackupManager.getStatus = function () {

        return {

            state:
                BackupManager.state,

            initialized:
                BackupManager.initialized,

            backupCount:
                BackupManager.backups.length,

            maxBackups:
                BackupManager.maxBackups,

            lastBackup:
                BackupManager.lastBackup,

            lastRestore:
                BackupManager.lastRestore,

            lastError:
                BackupManager.lastError,

            currentOperation:
                BackupManager.currentOperation

        };

    };


    /* ========================================================
     * SAFE SERIALIZATION
     * ======================================================== */

    BackupManager.safeClone = function (value) {

        try {

            return JSON.parse(
                JSON.stringify(value)
            );

        } catch (error) {

            return null;

        }

    };


    /* ========================================================
     * LOCAL STORAGE SNAPSHOT
     * ======================================================== */

    BackupManager.captureLocalStorage =
        function () {

            const snapshot = {};

            try {

                for (
                    let index = 0;
                    index < localStorage.length;
                    index++
                ) {

                    const key =
                        localStorage.key(index);

                    if (!key) {
                        continue;
                    }

                    /*
                     * Backup-System selbst nicht
                     * rekursiv sichern.
                     */

                    if (
                        key.indexOf(
                            BackupManager.backupPrefix
                        ) === 0
                    ) {
                        continue;
                    }

                    if (
                        key ===
                        BackupManager.storageKey
                    ) {
                        continue;
                    }

                    snapshot[key] =
                        localStorage.getItem(key);

                }

            } catch (error) {

                console.warn(
                    "[HalDo Backup] LocalStorage:",
                    error
                );

            }

            return snapshot;

        };


    /* ========================================================
     * INDEXED DB INFORMATION
     * ======================================================== */

    BackupManager.captureIndexedDBInfo =
        async function () {

            if (
                !window.indexedDB
            ) {

                return {

                    supported:
                        false,

                    databases:
                        []

                };

            }

            /*
             * Die tatsächlichen Datenbanken werden
             * über vorhandene HalDo-Storage-Systeme
             * erweitert.
             */

            try {

                if (
                    typeof indexedDB.databases ===
                    "function"
                ) {

                    const databases =
                        await indexedDB.databases();

                    return {

                        supported:
                            true,

                        databases:
                            databases.map(
                                function (db) {

                                    return {

                                        name:
                                            db.name ||
                                            null,

                                        version:
                                            db.version ||
                                            null

                                    };

                                }
                            )

                    };

                }

            } catch (error) {

                console.warn(
                    "[HalDo Backup] IndexedDB:",
                    error
                );

            }

            return {

                supported:
                    true,

                databases:
                    []

            };

        };


    /* ========================================================
     * HALDO STORAGE SNAPSHOT
     * ======================================================== */

    BackupManager.captureHalDoStorage =
        async function () {

            const result = {};

            try {

                const storage =
                    window.HalDoStorage ||
                    HalDoOS.storage;

                if (
                    storage
                ) {

                    if (
                        typeof storage.export ===
                        "function"
                    ) {

                        result.data =
                            await storage.export();

                        result.source =
                            "HalDoStorage";

                        return result;

                    }

                    if (
                        typeof storage.exportAll ===
                        "function"
                    ) {

                        result.data =
                            await storage.exportAll();

                        result.source =
                            "HalDoStorage";

                        return result;

                    }

                }

            } catch (error) {

                console.warn(
                    "[HalDo Backup] HalDo Storage:",
                    error
                );

                result.error =
                    error.message;

            }


            return {

                source:
                    "fallback",

                data:
                    {}

            };

        };


    /* ========================================================
     * SYSTEM INFORMATION
     * ======================================================== */

    BackupManager.captureSystemInfo =
        function () {

            return {

                osVersion:
                    "20.0.0",

                language:
                    document.documentElement
                        .lang ||
                    navigator.language ||
                    "en",

                platform:
                    navigator.platform ||
                    "unknown",

                online:
                    navigator.onLine,

                timestamp:
                    new Date()
                        .toISOString()

            };

        };


    /* ========================================================
     * CREATE BACKUP
     * ======================================================== */

    BackupManager.createBackup =
        async function (options) {

            options =
                options || {};


            if (
                BackupManager.currentOperation
            ) {

                return {

                    success:
                        false,

                    reason:
                        "operation-in-progress"

                };

            }


            BackupManager.currentOperation =
                "create";

            BackupManager.setState(
                "creating"
            );


            BackupManager.lastError =
                null;


            try {

                const id =
                    Date.now().toString(36) +
                    "-" +
                    Math.random()
                        .toString(36)
                        .slice(2, 8);


                const createdAt =
                    new Date()
                        .toISOString();


                const storage =
                    await BackupManager
                        .captureHalDoStorage();


                const indexedDB =
                    await BackupManager
                        .captureIndexedDBInfo();


                const localStorage =
                    BackupManager
                        .captureLocalStorage();


                const system =
                    BackupManager
                        .captureSystemInfo();


                const backup = {

                    id:
                        id,

                    version:
                        options.version ||
                        system.osVersion,

                    reason:
                        options.reason ||
                        "manual",

                    createdAt:
                        createdAt,

                    system:
                        system,

                    storage:
                        storage,

                    indexedDB:
                        indexedDB,

                    localStorage:
                        localStorage,

                    metadata: {

                        schema:
                            1,

                        managerVersion:
                            BackupManager.version,

                        application:
                            "HalDo AI OS",

                        platform:
                            system.platform

                    }

                };


                const key =
                    BackupManager.backupPrefix +
                    id;


                localStorage.setItem(
                    key,
                    JSON.stringify(backup)
                );


                BackupManager.backups.push(
                    {
                        id:
                            id,

                        version:
                            backup.version,

                        reason:
                            backup.reason,

                        createdAt:
                            createdAt,

                        size:
                            JSON.stringify(
                                backup
                            ).length
                    }
                );


                BackupManager.lastBackup =
                    backup;


                BackupManager.saveIndex();

                BackupManager.cleanup();


                BackupManager.currentOperation =
                    null;

                BackupManager.setState(
                    "ready"
                );


                BackupManager.emit(
                    "backup:created",
                    backup
                );


                return {

                    success:
                        true,

                    id:
                        id,

                    backup:
                        backup

                };

            } catch (error) {

                BackupManager.lastError =
                    error.message;

                BackupManager.currentOperation =
                    null;

                BackupManager.setState(
                    "error"
                );


                BackupManager.emit(
                    "backup:error",
                    {
                        operation:
                            "create",

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
     * INDEX
     * ======================================================== */

    BackupManager.saveIndex =
        function () {

            try {

                localStorage.setItem(
                    BackupManager.storageKey,
                    JSON.stringify(
                        BackupManager.backups
                    )
                );

                return true;

            } catch (error) {

                BackupManager.lastError =
                    error.message;

                return false;

            }

        };


    BackupManager.loadIndex =
        function () {

            try {

                const raw =
                    localStorage.getItem(
                        BackupManager.storageKey
                    );


                if (!raw) {

                    BackupManager.backups =
                        [];

                    return [];

                }


                const parsed =
                    JSON.parse(raw);


                BackupManager.backups =
                    Array.isArray(parsed)
                        ? parsed
                        : [];


                return BackupManager.backups;

            } catch (error) {

                BackupManager.backups =
                    [];

                BackupManager.lastError =
                    error.message;

                return [];

            }

        };


    /* ========================================================
     * GET BACKUPS
     * ======================================================== */

    BackupManager.getBackups =
        function () {

            return BackupManager.backups
                .map(function (backup) {

                    return Object.assign(
                        {},
                        backup
                    );

                });

        };


    /* ========================================================
     * GET BACKUP
     * ======================================================== */

    BackupManager.getBackup =
        function (id) {

            if (!id) {
                return null;
            }


            try {

                const raw =
                    localStorage.getItem(
                        BackupManager
                            .backupPrefix +
                        id
                    );


                if (!raw) {
                    return null;
                }


                return JSON.parse(raw);

            } catch (error) {

                BackupManager.lastError =
                    error.message;

                return null;

            }

        };


    /* ========================================================
     * RESTORE BACKUP
     * ======================================================== */

    BackupManager.restoreBackup =
        async function (id, options) {

            options =
                options || {};


            if (
                BackupManager.currentOperation
            ) {

                return {

                    success:
                        false,

                    reason:
                        "operation-in-progress"

                };

            }


            const backup =
                BackupManager.getBackup(id);


            if (!backup) {

                return {

                    success:
                        false,

                    reason:
                        "backup-not-found"

                };

            }


            if (
                options.confirmed !== true
            ) {

                BackupManager.emit(
                    "backup:restore-confirmation-required",
                    {
                        id:
                            id
                    }
                );


                return {

                    success:
                        false,

                    reason:
                        "confirmation-required"

                };

            }


            BackupManager.currentOperation =
                "restore";


            BackupManager.setState(
                "restoring"
            );


            try {

                /*
                 * Vor einer Wiederherstellung
                 * erstellen wir einen zusätzlichen
                 * Sicherheits-Backup.
                 */

                const safety =
                    await BackupManager
                        .createBackup(
                            {
                                reason:
                                    "before-restore"
                            }
                        );


                if (!safety.success) {

                    throw new Error(
                        "Sicherheitsbackup vor Wiederherstellung fehlgeschlagen."
                    );

                }


                if (
                    backup.localStorage
                ) {

                    Object.keys(
                        backup.localStorage
                    ).forEach(
                        function (key) {

                            localStorage.setItem(
                                key,
                                backup.localStorage[key]
                            );

                        }
                    );

                }


                BackupManager.lastRestore =
                    {
                        id:
                            id,

                        restoredAt:
                            new Date()
                                .toISOString()
                    };


                BackupManager.currentOperation =
                    null;


                BackupManager.setState(
                    "ready"
                );


                BackupManager.emit(
                    "backup:restored",
                    BackupManager.lastRestore
                );


                return {

                    success:
                        true,

                    restored:
                        BackupManager
                            .lastRestore

                };

            } catch (error) {

                BackupManager.lastError =
                    error.message;

                BackupManager.currentOperation =
                    null;

                BackupManager.setState(
                    "error"
                );


                BackupManager.emit(
                    "backup:error",
                    {
                        operation:
                            "restore",

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
     * DELETE BACKUP
     * ======================================================== */

    BackupManager.deleteBackup =
        function (id) {

            if (!id) {
                return false;
            }


            try {

                localStorage.removeItem(
                    BackupManager
                        .backupPrefix +
                    id
                );


                BackupManager.backups =
                    BackupManager.backups
                        .filter(
                            function (backup) {

                                return (
                                    backup.id !==
                                    id
                                );

                            }
                        );


                BackupManager.saveIndex();


                BackupManager.emit(
                    "backup:deleted",
                    {
                        id:
                            id
                    }
                );


                return true;

            } catch (error) {

                BackupManager.lastError =
                    error.message;

                return false;

            }

        };


    /* ========================================================
     * CLEANUP
     * ======================================================== */

    BackupManager.cleanup =
        function () {

            if (
                BackupManager.backups.length <=
                BackupManager.maxBackups
            ) {

                return;

            }


            const sorted =
                BackupManager.backups
                    .slice()
                    .sort(
                        function (a, b) {

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
                    BackupManager.maxBackups
                );


            const keepIds =
                new Set(
                    keep.map(
                        function (item) {
                            return item.id;
                        }
                    )
                );


            BackupManager.backups
                .forEach(
                    function (backup) {

                        if (
                            !keepIds.has(
                                backup.id
                            )
                        ) {

                            try {

                                localStorage.removeItem(
                                    BackupManager
                                        .backupPrefix +
                                    backup.id
                                );

                            } catch (error) {
                                /* ignorieren */
                            }

                        }

                    }
                );


            BackupManager.backups =
                keep;


            BackupManager.saveIndex();

        };


    /* ========================================================
     * EXPORT BACKUP
     * ======================================================== */

    BackupManager.exportBackup =
        function (id) {

            const backup =
                BackupManager.getBackup(id);


            if (!backup) {

                return {

                    success:
                        false,

                    reason:
                        "backup-not-found"

                };

            }


            const data =
                JSON.stringify(
                    backup,
                    null,
                    2
                );


            const blob =
                new Blob(
                    [data],
                    {
                        type:
                            "application/json"
                    }
                );


            const url =
                URL.createObjectURL(
                    blob
                );


            const anchor =
                document.createElement(
                    "a"
                );


            anchor.href =
                url;

            anchor.download =
                "haldo-backup-" +
                id +
                ".json";


            document.body.appendChild(
                anchor
            );


            anchor.click();


            anchor.remove();


            URL.revokeObjectURL(
                url
            );


            BackupManager.emit(
                "backup:exported",
                {
                    id:
                        id
                }
            );


            return {

                success:
                    true

            };

        };


    /* ========================================================
     * IMPORT BACKUP
     * ======================================================== */

    BackupManager.importBackup =
        async function (file) {

            if (!file) {

                return {

                    success:
                        false,

                    reason:
                        "file-required"

                };

            }


            try {

                const text =
                    await file.text();


                const backup =
                    JSON.parse(text);


                if (
                    !backup.id ||
                    !backup.metadata
                ) {

                    throw new Error(
                        "Ungültiges HalDo-Backup."
                    );

                }


                const key =
                    BackupManager
                        .backupPrefix +
                    backup.id;


                localStorage.setItem(
                    key,
                    JSON.stringify(
                        backup
                    )
                );


                BackupManager.loadIndex();


                if (
                    !BackupManager.backups
                        .some(
                            function (item) {
                                return (
                                    item.id ===
                                    backup.id
                                );
                            }
                        )
                ) {

                    BackupManager.backups.push(
                        {
                            id:
                                backup.id,

                            version:
                                backup.version,

                            reason:
                                backup.reason,

                            createdAt:
                                backup.createdAt,

                            size:
                                JSON.stringify(
                                    backup
                                ).length
                        }
                    );

                }


                BackupManager.saveIndex();
                BackupManager.cleanup();


                BackupManager.emit(
                    "backup:imported",
                    {
                        id:
                            backup.id
                    }
                );


                return {

                    success:
                        true,

                    id:
                        backup.id

                };

            } catch (error) {

                BackupManager.lastError =
                    error.message;


                BackupManager.emit(
                    "backup:error",
                    {
                        operation:
                            "import",

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
     * INIT
     * ======================================================== */

    BackupManager.init =
        function () {

            if (
                BackupManager.initialized
            ) {

                return BackupManager;

            }


            BackupManager.loadIndex();

            BackupManager.initialized =
                true;

            BackupManager.setState(
                "ready"
            );


            BackupManager.emit(
                "backup:manager-ready",
                BackupManager.getStatus()
            );


            return BackupManager;

        };


    /* ========================================================
     * GLOBAL REGISTRATION
     * ======================================================== */

    window.HalDoBackupManager =
        BackupManager;

    window.HalDoV20BackupManager =
        BackupManager;

    HalDoOS.backupManager =
        BackupManager;


    /* ========================================================
     * BOOT
     * ======================================================== */

    function boot() {

        BackupManager.init();

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