*

============================================================

 HALDO AI OS 18

 STORAGE MANAGER

 Professional Ultimate Foundation

============================================================

 Datei:

 js/storage-manager.js

 Aufgabe:

 - zentrale Datenverwaltung

 - localStorage

 - sessionStorage

 - Namespaces

 - JSON-Daten

 - Einstellungen

 - Konfiguration

 - Cache

 - sichere Fehlerbehandlung

 - Speicherstatus

 - Events

 - Vorbereitung für zukünftige Datenbanken

 WICHTIG:

 Keine anderen Dateien werden hier überschrieben.

 Dieses System stellt eine zentrale Speicher-API bereit.

============================================================

*/

"use strict";

(function (window) {

    /* ========================================================

       STORAGE MANAGER

       ======================================================== */

    const HalDoStorageManager = {

        /* ====================================================

           INFORMATION

           ==================================================== */

        name:

            "HalDo Storage Manager",

        version:

            "18.0.0",

        status:

            "CREATED",

        initialized:

            false,

        /* ====================================================

           STORAGE PREFIX

           ==================================================== */

        prefix:

            "haldo_os18_",

        /* ====================================================

           DEFAULT NAMESPACES

           ==================================================== */

        namespaces: [

            "system",

            "settings",

            "user",

            "chat",

            "ai",

            "keyboard",

            "language",

            "theme",

            "apps",

            "cache",

            "security"

        ],

        /* ====================================================

           STORAGE REFERENCES

           ==================================================== */

        local:

            null,

        session:

            null,

        /* ====================================================

           STORAGE STATUS

           ==================================================== */

        availability: {

            local:

                false,

            session:

                false

        },

        /* ====================================================

           EVENTS

           ==================================================== */

        listeners:

            new Map(),

        /* ====================================================

           INITIALIZE

           ==================================================== */

        initialize() {

            if (

                this.initialized

            ) {

                return true;

            }

            this.status =

                "INITIALIZING";

            this.connectStorage();

            this.createNamespaces();

            this.initialized =

                true;

            this.status =

                "READY";

            this.emit(

                "ready",

                this.getStatus()

            );

            this.log(

                "Storage Manager ist bereit."

            );

            return true;

        },

        /* ====================================================

           STORAGE VERBINDEN

           ==================================================== */

        connectStorage() {

            try {

                this.local =

                    window.localStorage;

                const testKey =

                    `${this.prefix}local_test`;

                this.local.setItem(

                    testKey,

                    "ok"

                );

                this.local.removeItem(

                    testKey

                );

                this.availability.local =

                    true;

            } catch (error) {

                this.local =

                    null;

                this.availability.local =

                    false;

                this.logError(

                    error,

                    "localStorage"

                );

            }

            try {

                this.session =

                    window.sessionStorage;

                const testKey =

                    `${this.prefix}session_test`;

                this.session.setItem(

                    testKey,

                    "ok"

                );

                this.session.removeItem(

                    testKey

                );

                this.availability.session =

                    true;

            } catch (error) {

                this.session =

                    null;

                this.availability.session =

                    false;

                this.logError(

                    error,

                    "sessionStorage"

                );

            }

            return this.availability;

        },

        /* ====================================================

           NAMESPACE ERSTELLEN

           ==================================================== */

        createNamespaces() {

            this.namespaces.forEach(

                namespace => {

                    const key =

                        this.buildKey(

                            namespace,

                            "initialized"

                        );

                    if (

                        !this.hasRaw(

                            key

                        )

                    ) {

                        this.setRaw(

                            key,

                            "true"

                        );

                    }

                }

            );

            return true;

        },

        /* ====================================================

           KEY ERSTELLEN

           ==================================================== */

        buildKey(

            namespace,

            key

        ) {

            const safeNamespace =

                String(

                    namespace

                )

                .trim()

                .toLowerCase()

                .replace(

                    /[^a-z0-9_-]/g,

                    "_"

                );

            const safeKey =

                String(

                    key

                )

                .trim()

                .replace(

                    /[^a-zA-Z0-9_.-]/g,

                    "_"

                );

            return (

                this.prefix +

                safeNamespace +

                "_" +

                safeKey

            );

        },

        /* ====================================================

           RAW SET

           ==================================================== */

        setRaw(

            key,

            value,

            storage = "local"

        ) {

            const target =

                this.getStorage(

                    storage

                );

            if (

                !target

            ) {

                return false;

            }

            try {

                target.setItem(

                    key,

                    String(value)

                );

                this.emit(

                    "set",

                    {

                        key,

                        storage,

                        value

                    }

                );

                return true;

            } catch (error) {

                this.logError(

                    error,

                    `setRaw: ${key}`

                );

                return false;

            }

        },

        /* ====================================================

           RAW GET

           ==================================================== */

        getRaw(

            key,

            defaultValue = null,

            storage = "local"

        ) {

            const target =

                this.getStorage(

                    storage

                );

            if (

                !target

            ) {

                return defaultValue;

            }

            try {

                const value =

                    target.getItem(

                        key

                    );

                if (

                    value ===

                    null

                ) {

                    return defaultValue;

                }

                return value;

            } catch (error) {

                this.logError(

                    error,

                    `getRaw: ${key}`

                );

                return defaultValue;

            }

        },

        /* ====================================================

           JSON SET

           ==================================================== */

        set(

            namespace,

            key,

            value,

            storage = "local"

        ) {

            const fullKey =

                this.buildKey(

                    namespace,

                    key

                );

            try {

                const serialized =

                    JSON.stringify(

                        value

                    );

                return this.setRaw(

                    fullKey,

                    serialized,

                    storage

                );

            } catch (error) {

                this.logError(

                    error,

                    `set: ${namespace}/${key}`

                );

                return false;

            }

        },

        /* ====================================================

           JSON GET

           ==================================================== */

        get(

            namespace,

            key,

            defaultValue = null,

            storage = "local"

        ) {

            const fullKey =

                this.buildKey(

                    namespace,

                    key

                );

            const raw =

                this.getRaw(

                    fullKey,

                    null,

                    storage

                );

            if (

                raw ===

                null

            ) {

                return defaultValue;

            }

            try {

                return JSON.parse(

                    raw

                );

            } catch (error) {

                /*

                   Falls alte oder beschädigte Daten

                   vorhanden sind, nicht das gesamte

                   System stoppen.

                */

                this.logError(

                    error,

                    `JSON parse: ${namespace}/${key}`

                );

                return defaultValue;

            }

        },

        /* ====================================================

           EXISTS

           ==================================================== */

        has(

            namespace,

            key,

            storage = "local"

        ) {

            const fullKey =

                this.buildKey(

                    namespace,

                    key

                );

            return this.hasRaw(

                fullKey,

                storage

            );

        },

        /* ====================================================

           RAW EXISTS

           ==================================================== */

        hasRaw(

            key,

            storage = "local"

        ) {

            const target =

                this.getStorage(

                    storage

                );

            if (

                !target

            ) {

                return false;

            }

            try {

                return (

                    target.getItem(

                        key

                    ) !==

                    null

                );

            } catch (error) {

                return false;

            }

        },

        /* ====================================================

           DELETE

           ==================================================== */

        remove(

            namespace,

            key,

            storage = "local"

        ) {

            const fullKey =

                this.buildKey(

                    namespace,

                    key

                );

            return this.removeRaw(

                fullKey,

                storage

            );

        },

        /* ====================================================

           RAW DELETE

           ==================================================== */

        removeRaw(

            key,

            storage = "local"

        ) {

            const target =

                this.getStorage(

                    storage

                );

            if (

                !target

            ) {

                return false;

            }

            try {

                target.removeItem(

                    key

                );

                this.emit(

                    "remove",

                    {

                        key,

                        storage

                    }

                );

                return true;

            } catch (error) {

                this.logError(

                    error,

                    `removeRaw: ${key}`

                );

                return false;

            }

        },

        /* ====================================================

           NAMESPACE CLEAR

           ==================================================== */

        clearNamespace(

            namespace,

            storage = "local"

        ) {

            const target =

                this.getStorage(

                    storage

                );

            if (

                !target

            ) {

                return false;

            }

            const prefix =

                this.prefix +

                String(

                    namespace

                )

                .trim()

                .toLowerCase()

                .replace(

                    /[^a-z0-9_-]/g,

                    "_"

                ) +

                "_";

            const keys = [];

            try {

                for (

                    let i = 0;

                    i < target.length;

                    i++

                ) {

                    const key =

                        target.key(

                            i

                        );

                    if (

                        key &&

                        key.startsWith(

                            prefix

                        )

                    ) {

                        keys.push(

                            key

                        );

                    }

                }

                keys.forEach(

                    key => {

                        target.removeItem(

                            key

                        );

                    }

                );

                this.emit(

                    "namespace-cleared",

                    {

                        namespace,

                        storage,

                        count:

                            keys.length

                    }

                );

                return true;

            } catch (error) {

                this.logError(

                    error,

                    `clearNamespace: ${namespace}`

                );

                return false;

            }

        },

        /* ====================================================

           ALLES HALDO DATEN LÖSCHEN

           ==================================================== */

        clearAll(

            storage = "local"

        ) {

            const target =

                this.getStorage(

                    storage

                );

            if (

                !target

            ) {

                return false;

            }

            const keys = [];

            try {

                for (

                    let i = 0;

                    i < target.length;

                    i++

                ) {

                    const key =

                        target.key(

                            i

                        );

                    if (

                        key &&

                        key.startsWith(

                            this.prefix

                        )

                    ) {

                        keys.push(

                            key

                        );

                    }

                }

                keys.forEach(

                    key => {

                        target.removeItem(

                            key

                        );

                    }

                );

                this.emit(

                    "cleared",

                    {

                        storage,

                        count:

                            keys.length

                    }

                );

                return true;

            } catch (error) {

                this.logError(

                    error,

                    "clearAll"

                );

                return false;

            }

        },

        /* ====================================================

           SETTINGS

           ==================================================== */

        setSetting(

            key,

            value

        ) {

            return this.set(

                "settings",

                key,

                value,

                "local"

            );

        },

        getSetting(

            key,

            defaultValue = null

        ) {

            return this.get(

                "settings",

                key,

                defaultValue,

                "local"

            );

        },

        removeSetting(

            key

        ) {

            return this.remove(

                "settings",

                key,

                "local"

            );

        },

        /* ====================================================

           SYSTEM DATA

           ==================================================== */

        setSystemData(

            key,

            value

        ) {

            return this.set(

                "system",

                key,

                value,

                "local"

            );

        },

        getSystemData(

            key,

            defaultValue = null

        ) {

            return this.get(

                "system",

                key,

                defaultValue,

                "local"

            );

        },

        /* ====================================================

           USER DATA

           ==================================================== */

        setUserData(

            key,

            value

        ) {

            return this.set(

                "user",

                key,

                value,

                "local"

            );

        },

        getUserData(

            key,

            defaultValue = null

        ) {

            return this.get(

                "user",

                key,

                defaultValue,

                "local"

            );

        },

        /* ====================================================

           CHAT DATA

           ==================================================== */

        setChatData(

            key,

            value

        ) {

            return this.set(

                "chat",

                key,

                value,

                "local"

            );

        },

        getChatData(

            key,

            defaultValue = null

        ) {

            return this.get(

                "chat",

                key,

                defaultValue,

                "local"

            );

        },

        /* ====================================================

           AI DATA

           ==================================================== */

        setAIData(

            key,

            value

        ) {

            return this.set(

                "ai",

                key,

                value,

                "local"

            );

        },

        getAIData(

            key,

            defaultValue = null

        ) {

            return this.get(

                "ai",

                key,

                defaultValue,

                "local"

            );

        },

        /* ====================================================

           SESSION DATA

           ==================================================== */

        setSession(

            namespace,

            key,

            value

        ) {

            return this.set(

                namespace,

                key,

                value,

                "session"

            );

        },

        getSession(

            namespace,

            key,

            defaultValue = null

        ) {

            return this.get(

                namespace,

                key,

                defaultValue,

                "session"

            );

        },

        /* ====================================================

           CACHE

           ==================================================== */

        setCache(

            key,

            value

        ) {

            return this.set(

                "cache",

                key,

                {

                    value,

                    timestamp:

                        Date.now()

                },

                "local"

            );

        },

        getCache(

            key,

            defaultValue = null

        ) {

            const data =

                this.get(

                    "cache",

                    key,

                    null,

                    "local"

                );

            if (

                !data

            ) {

                return defaultValue;

            }

            return (

                Object.prototype.hasOwnProperty.call(

                    data,

                    "value"

                )

            )

                ? data.value

                : defaultValue;

        },

        removeCache(

            key

        ) {

            return this.remove(

                "cache",

                key,

                "local"

            );

        },

        /* ====================================================

           EXPORT

           ==================================================== */

        exportData(

            namespace = null,

            storage = "local"

        ) {

            const target =

                this.getStorage(

                    storage

                );

            if (

                !target

            ) {

                return {};

            }

            const result =

                {};

            const namespacePrefix =

                namespace

                    ? (

                        this.prefix +

                        String(

                            namespace

                        )

                        .trim()

                        .toLowerCase()

                        .replace(

                            /[^a-z0-9_-]/g,

                            "_"

                        ) +

                        "_"

                    )

                    : this.prefix;

            try {

                for (

                    let i = 0;

                    i < target.length;

                    i++

                ) {

                    const key =

                        target.key(

                            i

                        );

                    if (

                        !key ||

                        !key.startsWith(

                            namespacePrefix

                        )

                    ) {

                        continue;

                    }

                    const raw =

                        target.getItem(

                            key

                        );

                    try {

                        result[key] =

                            JSON.parse(

                                raw

                            );

                    } catch (

                        parseError

                    ) {

                        result[key] =

                            raw;

                    }

                }

                return result;

            } catch (error) {

                this.logError(

                    error,

                    "exportData"

                );

                return {};

            }

        },

        /* ====================================================

           IMPORT

           ==================================================== */

        importData(

            data,

            storage = "local"

        ) {

            if (

                !data ||

                typeof data !==

                "object"

            ) {

                return false;

            }

            try {

                Object.keys(

                    data

                ).forEach(

                    key => {

                        if (

                            !key.startsWith(

                                this.prefix

                            )

                        ) {

                            return;

                        }

                        const value =

                            data[key];

                        if (

                            typeof value ===

                            "string"

                        ) {

                            this.setRaw(

                                key,

                                value,

                                storage

                            );

                        } else {

                            this.setRaw(

                                key,

                                JSON.stringify(

                                    value

                                ),

                                storage

                            );

                        }

                    }

                );

                this.emit(

                    "imported"

                );

                return true;

            } catch (error) {

                this.logError(

                    error,

                    "importData"

                );

                return false;

            }

        },

        /* ====================================================

           STORAGE ERMITTELN

           ==================================================== */

        getStorage(

            type

        ) {

            if (

                type ===

                "session"

            ) {

                return this.session;

            }

            return this.local;

        },

        /* ====================================================

           STATUS

           ==================================================== */

        getStatus() {

            return {

                name:

                    this.name,

                version:

                    this.version,

                status:

                    this.status,

                initialized:

                    this.initialized,

                prefix:

                    this.prefix,

                localStorage:

                    this.availability.local,

                sessionStorage:

                    this.availability.session,

                namespaces:

                    [

                        ...this.namespaces

                    ]

            };

        },

        /* ====================================================

           EVENTS

           ==================================================== */

        on(

            eventName,

            callback

        ) {

            if (

                typeof callback !==

                "function"

            ) {

                return false;

            }

            if (

                !this.listeners.has(

                    eventName

                )

            ) {

                this.listeners.set(

                    eventName,

                    []

                );

            }

            this.listeners

                .get(eventName)

                .push(callback);

            return true;

        },

        /* ====================================================

           EVENT OFF

           ==================================================== */

        off(

            eventName,

            callback

        ) {

            const listeners =

                this.listeners.get(

                    eventName

                );

            if (

                !listeners

            ) {

                return false;

            }

            const index =

                listeners.indexOf(

                    callback

                );

            if (

                index === -1

            ) {

                return false;

            }

            listeners.splice(

                index,

                1

            );

            return true;

        },

        /* ====================================================

           EVENT EMIT

           ==================================================== */

        emit(

            eventName,

            data = null

        ) {

            const listeners =

                this.listeners.get(

                    eventName

                );

            if (

                !listeners

            ) {

                return;

            }

            listeners

                .slice()

                .forEach(

                    callback => {

                        try {

                            callback(

                                data

                            );

                        } catch (error) {

                            this.logError(

                                error,

                                `Event: ${eventName}`

                            );

                        }

                    }

                );

        },

        /* ====================================================

           ERROR

           ==================================================== */

        logError(

            error,

            source = "Storage Manager"

        ) {

            console.error(

                "[HalDo Storage Manager]",

                source,

                error

            );

            if (

                window.HalDoKernel &&

                typeof window.HalDoKernel.handleError ===

                "function"

            ) {

                window.HalDoKernel.handleError(

                    error,

                    source

                );

            }

        },

        /* ====================================================

           LOG

           ==================================================== */

        log(

            message,

            data = null

        ) {

            if (

                data !== null

            ) {

                console.log(

                    "[HalDo Storage Manager]",

                    message,

                    data

                );

            } else {

                console.log(

                    "[HalDo Storage Manager]",

                    message

                );

            }

        }

    };

    /* ========================================================

       GLOBAL API

       ======================================================== */

    window.HalDoStorageManager =

        HalDoStorageManager;

    if (

        !window.HalDo

    ) {

        window.HalDo = {};

    }

    window.HalDo.storage =

        HalDoStorageManager;

    /* ========================================================

       INITIALISIERUNG

       ======================================================== */

    function initializeStorageManager() {

        HalDoStorageManager.initialize();

    }

    if (

        document.readyState ===

        "loading"

    ) {

        document.addEventListener(

            "DOMContentLoaded",

            initializeStorageManager,

            {

                once: true

            }

        );

    } else {

        initializeStorageManager();

    }

    /* ========================================================

       CONSOLE

       ======================================================== */

    console.log(

        "=============================================="

    );

    console.log(

        "HalDo AI OS 18 Storage Manager"

    );

    console.log(

        "Professional Ultimate Foundation"

    );

    console.log(

        "Storage Manager geladen."

    );

    console.log(

        "=============================================="

    );

})(window);