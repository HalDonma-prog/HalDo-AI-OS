/*
============================================================
 HALDO AI OS 18
 CONFIG MANAGER
 Professional Ultimate Foundation
============================================================

 Datei:
 js/config-manager.js

 Aufgabe:
 - zentrale Systemkonfiguration
 - Versionsverwaltung
 - UI-Konfiguration
 - AI-Konfiguration
 - Sprache
 - Tastatur
 - Theme
 - Animation
 - Audio / Sprache
 - Gerätefunktionen
 - Feature-Schalter
 - Speicherung über Storage Manager
 - Events
============================================================
*/

"use strict";


(function (window) {


    /* ========================================================
       CONFIG MANAGER
       ======================================================== */

    const HalDoConfigManager = {


        /* ====================================================
           INFORMATION
           ==================================================== */

        name:
            "HalDo Configuration Manager",

        version:
            "18.0.0",

        status:
            "CREATED",

        initialized:
            false,


        /* ====================================================
           CORE REFERENCES
           ==================================================== */

        storage:
            null,

        kernel:
            null,

        system:
            null,


        /* ====================================================
           DEFAULT CONFIGURATION
           ==================================================== */

        defaults: {


            /* -----------------------------------------------
               SYSTEM
            ----------------------------------------------- */

            system: {

                name:
                    "HalDo AI OS",

                version:
                    "18.0.0",

                edition:
                    "Professional Ultimate Foundation",

                language:
                    "de-DE",

                region:
                    "DE",

                startupEnabled:
                    true,

                debug:
                    true

            },


            /* -----------------------------------------------
               UI
            ----------------------------------------------- */

            ui: {

                theme:
                    "system",

                accent:
                    "haldo",

                animations:
                    true,

                transitions:
                    true,

                reducedMotion:
                    false,

                fullscreen:
                    false,

                compactMode:
                    false,

                sidebar:
                    true,

                statusBar:
                    true,

                notifications:
                    true

            },


            /* -----------------------------------------------
               LOGO / AVATAR
            ----------------------------------------------- */

            avatar: {

                enabled:
                    true,

                image:
                    "assets/logo/logo.png",

                fallbackImage:
                    "logo.png",

                animation:
                    true,

                glow:
                    true,

                speakingAnimation:
                    true,

                mouthMovement:
                    true,

                rotation:
                    false,

                breathing:
                    true

            },


            /* -----------------------------------------------
               AI
            ----------------------------------------------- */

            ai: {

                enabled:
                    true,

                assistantName:
                    "HalDo AI",

                welcomeEnabled:
                    true,

                voiceEnabled:
                    true,

                speechRecognition:
                    true,

                textToSpeech:
                    true,

                streaming:
                    true,

                history:
                    true,

                memory:
                    true,

                context:
                    true

            },


            /* -----------------------------------------------
               LANGUAGE
            ----------------------------------------------- */

            language: {

                default:
                    "de-DE",

                available: [

                    "de-DE",

                    "en-US",

                    "ku"

                ],

                autoDetect:
                    true

            },


            /* -----------------------------------------------
               EZIDI / ÊZÎDÎ KEYBOARD
            ----------------------------------------------- */

            keyboard: {

                enabled:
                    true,

                defaultLayout:
                    "standard",

                ezidiEnabled:
                    true,

                ezidiLayout:
                    "ezidi",

                customCharacters:
                    true,

                suggestions:
                    true,

                autocorrect:
                    true,

                multilingual:
                    true

            },


            /* -----------------------------------------------
               AUDIO
            ----------------------------------------------- */

            audio: {

                enabled:
                    true,

                volume:
                    1,

                systemSounds:
                    true,

                voice:
                    true,

                speakingIndicator:
                    true

            },


            /* -----------------------------------------------
               PRIVACY
            ----------------------------------------------- */

            privacy: {

                analytics:
                    false,

                telemetry:
                    false,

                localStorage:
                    true,

                sessionStorage:
                    true

            },


            /* -----------------------------------------------
               FEATURES
            ----------------------------------------------- */

            features: {

                dashboard:
                    true,

                chat:
                    true,

                settings:
                    true,

                applications:
                    true,

                files:
                    true,

                notifications:
                    true,

                keyboard:
                    true,

                voice:
                    true,

                camera:
                    true,

                microphone:
                    true,

                offlineMode:
                    true,

                developerMode:
                    true

            }

        },


        /* ====================================================
           CURRENT CONFIG
           ==================================================== */

        config:
            null,


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


            this.connectCore();


            this.load();


            this.initialized =
                true;


            this.status =
                "READY";


            this.emit(
                "ready",
                this.getStatus()
            );


            this.log(
                "Config Manager ist bereit."
            );


            return true;

        },


        /* ====================================================
           CORE VERBINDEN
           ==================================================== */

        connectCore() {


            this.storage =
                window.HalDoStorageManager ||
                null;


            this.kernel =
                window.HalDoKernel ||
                null;


            this.system =
                window.HalDoSystem ||
                null;


            return true;

        },


        /* ====================================================
           CONFIG LADEN
           ==================================================== */

        load() {


            this.connectCore();


            let saved =
                null;


            if (
                this.storage &&
                typeof this.storage.get ===
                "function"
            ) {

                saved =
                    this.storage.get(
                        "system",
                        "configuration",
                        null
                    );

            }


            this.config =
                this.merge(
                    this.clone(
                        this.defaults
                    ),
                    saved || {}
                );


            this.emit(
                "loaded",
                this.config
            );


            return this.config;

        },


        /* ====================================================
           CONFIG SPEICHERN
           ==================================================== */

        save() {


            this.connectCore();


            if (
                !this.config
            ) {

                return false;

            }


            if (
                this.storage &&
                typeof this.storage.set ===
                "function"
            ) {

                const success =
                    this.storage.set(
                        "system",
                        "configuration",
                        this.config
                    );


                if (
                    success
                ) {

                    this.emit(
                        "saved",
                        this.config
                    );

                }


                return success;

            }


            return false;

        },


        /* ====================================================
           GET
           ==================================================== */

        get(
            path,
            defaultValue = null
        ) {


            if (
                !this.config
            ) {

                return defaultValue;

            }


            const parts =
                String(
                    path
                )
                .split(".")
                .filter(
                    part =>
                        part.length > 0
                );


            let current =
                this.config;


            for (
                const part of parts
            ) {


                if (
                    current === null ||
                    current === undefined ||
                    !Object.prototype.hasOwnProperty.call(
                        current,
                        part
                    )
                ) {

                    return defaultValue;

                }


                current =
                    current[part];

            }


            return current;

        },


        /* ====================================================
           SET
           ==================================================== */

        set(
            path,
            value,
            save = true
        ) {


            if (
                !this.config
            ) {

                this.config =
                    this.clone(
                        this.defaults
                    );

            }


            const parts =
                String(
                    path
                )
                .split(".")
                .filter(
                    part =>
                        part.length > 0
                );


            if (
                parts.length ===
                0
            ) {

                return false;

            }


            let current =
                this.config;


            for (
                let i = 0;
                i < parts.length - 1;
                i++
            ) {


                const part =
                    parts[i];


                if (
                    !current[part] ||
                    typeof current[part] !==
                    "object"
                ) {

                    current[part] =
                        {};

                }


                current =
                    current[part];

            }


            const finalKey =
                parts[
                    parts.length - 1
                ];


            const oldValue =
                current[
                    finalKey
                ];


            current[
                finalKey
            ] =
                value;


            const change = {

                path,

                oldValue,

                value

            };


            this.emit(
                "changed",
                change
            );


            if (
                save
            ) {

                this.save();

            }


            return true;

        },


        /* ====================================================
           DELETE
           ==================================================== */

        remove(
            path,
            save = true
        ) {


            const parts =
                String(
                    path
                )
                .split(".")
                .filter(
                    part =>
                        part.length > 0
                );


            if (
                parts.length ===
                0
            ) {

                return false;

            }


            let current =
                this.config;


            for (
                let i = 0;
                i < parts.length - 1;
                i++
            ) {


                if (
                    !current ||
                    typeof current !==
                    "object"
                ) {

                    return false;

                }


                current =
                    current[
                        parts[i]
                    ];

            }


            const finalKey =
                parts[
                    parts.length - 1
                ];


            if (
                !Object.prototype.hasOwnProperty.call(
                    current,
                    finalKey
                )
            ) {

                return false;

            }


            delete current[
                finalKey
            ];


            if (
                save
            ) {

                this.save();

            }


            this.emit(
                "removed",
                {

                    path

                }
            );


            return true;

        },


        /* ====================================================
           RESET
           ==================================================== */

        reset(
            save = true
        ) {


            this.config =
                this.clone(
                    this.defaults
                );


            if (
                save
            ) {

                this.save();

            }


            this.emit(
                "reset",
                this.config
            );


            return true;

        },


        /* ====================================================
           DEFAULTS ABRUFEN
           ==================================================== */

        getDefaults() {


            return this.clone(
                this.defaults
            );

        },


        /* ====================================================
           CONFIG EXPORTIEREN
           ==================================================== */

        export() {


            return this.clone(
                this.config
            );

        },


        /* ====================================================
           CONFIG IMPORTIEREN
           ==================================================== */

        import(
            data,
            save = true
        ) {


            if (
                !data ||
                typeof data !==
                "object"
            ) {

                return false;

            }


            this.config =
                this.merge(
                    this.clone(
                        this.defaults
                    ),
                    data
                );


            if (
                save
            ) {

                this.save();

            }


            this.emit(
                "imported",
                this.config
            );


            return true;

        },


        /* ====================================================
           THEME
           ==================================================== */

        getTheme() {


            return this.get(
                "ui.theme",
                "system"
            );

        },


        setTheme(
            theme
        ) {


            const allowed = [

                "system",

                "light",

                "dark"

            ];


            if (
                !allowed.includes(
                    theme
                )
            ) {

                return false;

            }


            return this.set(
                "ui.theme",
                theme
            );

        },


        /* ====================================================
           SPRACHE
           ==================================================== */

        getLanguage() {


            return this.get(
                "language.default",
                "de-DE"
            );

        },


        setLanguage(
            language
        ) {


            if (
                typeof language !==
                "string" ||
                language.length ===
                0
            ) {

                return false;

            }


            return this.set(
                "language.default",
                language
            );

        },


        /* ====================================================
           AVATAR
           ==================================================== */

        getAvatarConfig() {


            return this.get(
                "avatar",
                {}
            );

        },


        setAvatarOption(
            option,
            value
        ) {


            return this.set(
                `avatar.${option}`,
                value
            );

        },


        /* ====================================================
           AI
           ==================================================== */

        getAIConfig() {


            return this.get(
                "ai",
                {}
            );

        },


        setAIOption(
            option,
            value
        ) {


            return this.set(
                `ai.${option}`,
                value
            );

        },


        /* ====================================================
           KEYBOARD
           ==================================================== */

        getKeyboardConfig() {


            return this.get(
                "keyboard",
                {}
            );

        },


        setKeyboardOption(
            option,
            value
        ) {


            return this.set(
                `keyboard.${option}`,
                value
            );

        },


        /* ====================================================
           FEATURE
           ==================================================== */

        isFeatureEnabled(
            feature
        ) {


            return (
                this.get(
                    `features.${feature}`,
                    false
                ) ===
                true
            );

        },


        setFeature(
            feature,
            enabled
        ) {


            return this.set(
                `features.${feature}`,
                Boolean(
                    enabled
                )
            );

        },


        /* ====================================================
           VERSION
           ==================================================== */

        getVersion() {


            return this.get(
                "system.version",
                this.version
            );

        },


        /* ====================================================
           CLONE
           ==================================================== */

        clone(
            value
        ) {


            if (
                value ===
                undefined
            ) {

                return undefined;

            }


            if (
                value ===
                null
            ) {

                return null;

            }


            try {

                return JSON.parse(
                    JSON.stringify(
                        value
                    )
                );

            } catch (error) {

                this.logError(
                    error,
                    "clone"
                );


                return value;

            }

        },


        /* ====================================================
           DEEP MERGE
           ==================================================== */

        merge(
            target,
            source
        ) {


            if (
                !source ||
                typeof source !==
                "object"
            ) {

                return target;

            }


            Object.keys(
                source
            ).forEach(
                key => {


                    const sourceValue =
                        source[key];


                    if (
                        sourceValue &&
                        typeof sourceValue ===
                        "object" &&
                        !Array.isArray(
                            sourceValue
                        )
                    ) {


                        if (
                            !target[key] ||
                            typeof target[key] !==
                            "object" ||
                            Array.isArray(
                                target[key]
                            )
                        ) {

                            target[key] =
                                {};

                        }


                        this.merge(
                            target[key],
                            sourceValue
                        );


                    } else {


                        target[key] =
                            sourceValue;

                    }

                }
            );


            return target;

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

                systemVersion:
                    this.getVersion(),

                language:
                    this.getLanguage(),

                theme:
                    this.getTheme(),

                aiEnabled:
                    this.get(
                        "ai.enabled",
                        false
                    ),

                avatarEnabled:
                    this.get(
                        "avatar.enabled",
                        false
                    ),

                keyboardEnabled:
                    this.get(
                        "keyboard.enabled",
                        false
                    ),

                featureCount:
                    Object.keys(
                        this.get(
                            "features",
                            {}
                        )
                    ).length

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
            source = "Config Manager"
        ) {


            console.error(
                "[HalDo Config Manager]",
                source,
                error
            );


            if (
                this.kernel &&
                typeof this.kernel.handleError ===
                "function"
            ) {

                this.kernel.handleError(
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
                    "[HalDo Config Manager]",
                    message,
                    data
                );

            } else {

                console.log(
                    "[HalDo Config Manager]",
                    message
                );

            }

        }

    };


    /* ========================================================
       GLOBAL API
       ======================================================== */

    window.HalDoConfigManager =
        HalDoConfigManager;


    if (
        !window.HalDo
    ) {

        window.HalDo = {};

    }


    window.HalDo.config =
        HalDoConfigManager;


    /* ========================================================
       INITIALISIERUNG
       ======================================================== */

    function initializeConfigManager() {


        HalDoConfigManager.connectCore();

        HalDoConfigManager.initialize();


    }


    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initializeConfigManager,
            {
                once: true
            }
        );

    } else {

        initializeConfigManager();

    }


    /* ========================================================
       CONSOLE
       ======================================================== */

    console.log(
        "=============================================="
    );

    console.log(
        "HalDo AI OS 18 Config Manager"
    );

    console.log(
        "Professional Ultimate Foundation"
    );

    console.log(
        "Config Manager geladen."
    );

    console.log(
        "=============================================="
    );


})(window);