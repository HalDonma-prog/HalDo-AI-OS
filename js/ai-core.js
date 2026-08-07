/*
=====================================

HalDo AI OS 18
AI Core Service

Professional Ultimate Foundation

Version:
18.0.0

=====================================
*/


const HalDoAICore = {


    /* =====================================
       GRUNDINFORMATIONEN
       ===================================== */

    name:
    "HalDo AI Core",


    version:
    "18.0.0",


    status:
    "ready",


    currentState:
    "idle",


    features: [

        "AI Assistant",

        "Learning Engine",

        "Code Builder",

        "Knowledge System",

        "Language System",

        "Voice System",

        "Speech System",

        "Conversation System",

        "Multilingual System",

        "Ezidi Language Support",

        "Kurdish Language Support",

        "AI Light Response System"

    ],


    /* =====================================
       SPRACHEN
       ===================================== */

    languages: [

        "Deutsch",

        "Kurdî",

        "Êzîdî",

        "English",

        "العربية",

        "Türkçe",

        "Français",

        "Español",

        "Italiano",

        "Português",

        "Русский",

        "فارسی"

    ],


    currentLanguage:
    "Deutsch",


    /* =====================================
       START
       ===================================== */

    start: function () {


        this.status =
        "running";


        this.currentState =
        "idle";


        console.log(
            "HalDo AI Core gestartet"
        );


        this.setLightState(
            "idle"
        );


        this.dispatchEvent(
            "core-started"
        );


        return true;

    },


    /* =====================================
       STOP
       ===================================== */

    stop: function () {


        this.status =
        "stopped";


        this.currentState =
        "idle";


        this.setLightState(
            "idle"
        );


        console.log(
            "HalDo AI Core gestoppt"
        );


        this.dispatchEvent(
            "core-stopped"
        );


        return true;

    },


    /* =====================================
       STATUS
       ===================================== */

    getStatus: function () {


        return {


            name:
            this.name,


            version:
            this.version,


            status:
            this.status,


            state:
            this.currentState,


            language:
            this.currentLanguage,


            features:
            this.features,


            languages:
            this.languages

        };

    },


    /* =====================================
       LICHTSYSTEM VERBINDEN
       ===================================== */

    setLightState: function (
        state
    ) {


        if (
            window.HalDoLight &&
            typeof window.HalDoLight.setState ===
            "function"
        ) {


            window.HalDoLight.setState(
                state
            );


        }

    },


    /* =====================================
       AI ZUSTAND SETZEN
       ===================================== */

    setState: function (
        state
    ) {


        const validStates = [

            "idle",

            "listening",

            "input",

            "thinking",

            "answering",

            "speaking",

            "success",

            "error"

        ];


        if (
            !validStates.includes(
                state
            )
        ) {


            state =
            "idle";


        }


        this.currentState =
        state;


        this.setLightState(
            state
        );


        this.dispatchEvent(
            "state-change",
            {
                state:
                state
            }
        );


        return state;

    },


    /* =====================================
       ZUHÖREN
       ===================================== */

    listen: function () {


        this.setState(
            "listening"
        );


        return {


            status:
            "listening"

        };

    },


    /* =====================================
       BENUTZEREINGABE
       ===================================== */

    input: function (
        message
    ) {


        this.setState(
            "input"
        );


        this.dispatchEvent(
            "user-input",
            {
                message:
                message
            }
        );


        return {


            input:
            message,


            status:
            "received"

        };

    },


    /* =====================================
       DENKEN / VERARBEITEN
       ===================================== */

    think: function (
        message
    ) {


        this.setState(
            "thinking"
        );


        console.log(
            "HalDo AI verarbeitet:",
            message
        );


        return {


            input:
            message,


            status:
            "thinking"

        };

    },


    /* =====================================
       ANTWORT VORBEREITEN
       ===================================== */

    answer: function (
        message
    ) {


        this.setState(
            "answering"
        );


        const response = {


            message:
            "HalDo AI Core ist vorbereitet.",


            input:
            message,


            language:
            this.currentLanguage,


            status:
            "answering"

        };


        this.dispatchEvent(
            "answer",
            response
        );


        return response;

    },


    /* =====================================
       SPRECHEN
       ===================================== */

    speak: function (
        text
    ) {


        this.setState(
            "speaking"
        );


        this.dispatchEvent(
            "speech-start",
            {
                text:
                text
            }
        );


        return {


            text:
            text,


            status:
            "speaking"

        };

    },


    /* =====================================
       SPRECHEN BEENDET
       ===================================== */

    speechFinished: function () {


        this.setState(
            "success"
        );


        this.dispatchEvent(
            "speech-finished"
        );


        window.setTimeout(
            function () {


                if (
                    this.status ===
                    "running"
                ) {


                    this.setState(
                        "idle"
                    );


                }


            }.bind(this),
            700
        );


    },


    /* =====================================
       ERFOLG
       ===================================== */

    success: function () {


        this.setState(
            "success"
        );


        window.setTimeout(
            function () {


                if (
                    this.status ===
                    "running"
                ) {


                    this.setState(
                        "idle"
                    );


                }


            }.bind(this),
            900
        );


        return true;

    },


    /* =====================================
       FEHLER
       ===================================== */

    error: function (
        error
    ) {


        this.setState(
            "error"
        );


        console.error(
            "HalDo AI Fehler:",
            error
        );


        this.dispatchEvent(
            "error",
            {
                error:
                error
            }
        );


        return false;

    },


    /* =====================================
       ASK
       ===================================== */

    ask: function (
        message
    ) {


        if (
            message ===
            undefined ||
            message ===
            null
        ) {


            return this.error(
                "Keine Eingabe erhalten."
            );


        }


        const cleanMessage =
            String(
                message
            ).trim();


        if (
            cleanMessage.length ===
            0
        ) {


            return this.error(
                "Die Eingabe ist leer."
            );


        }


        /* Eingabe */

        this.input(
            cleanMessage
        );


        /* Verarbeitung */

        this.think(
            cleanMessage
        );


        /*
         * Aktuelle Foundation-Antwort.
         *
         * Die echte KI-Verarbeitung kann
         * später hier angeschlossen werden.
         */

        const response = {


            message:
            "HalDo AI Core ist vorbereitet.",


            input:
            cleanMessage,


            language:
            this.currentLanguage,


            status:
            "ready"

        };


        /* Antwort */

        this.setState(
            "answering"
        );


        this.dispatchEvent(
            "response",
            response
        );


        /* Erfolgszustand */

        window.setTimeout(
            function () {


                if (
                    this.status ===
                    "running"
                ) {


                    this.setState(
                        "idle"
                    );


                }


            }.bind(this),
            900
        );


        return response;

    },


    /* =====================================
       SPRACHE ÄNDERN
       ===================================== */

    setLanguage: function (
        language
    ) {


        if (
            !language
        ) {


            return false;

        }


        const selected =
        String(
            language
        );


        const found =
        this.languages.find(
            function (
                item
            ) {


                return (
                    item.toLowerCase() ===
                    selected.toLowerCase()
                );

            }
        );


        if (!found) {


            console.warn(
                "HalDo AI Sprache nicht registriert:",
                language
            );


            return false;

        }


        this.currentLanguage =
        found;


        this.dispatchEvent(
            "language-change",
            {
                language:
                found
            }
        );


        return true;

    },


    /* =====================================
       SPRACHE ABFRAGEN
       ===================================== */

    getLanguage: function () {


        return this.currentLanguage;

    },


    /* =====================================
       EVENT SYSTEM
       ===================================== */

    dispatchEvent: function (
        eventName,
        detail
    ) {


        try {


            window.dispatchEvent(
                new CustomEvent(
                    "haldo-ai-" +
                    eventName,
                    {
                        detail:
                        detail || {}
                    }
                )
            );


        } catch (
            error
        ) {


            console.warn(
                "HalDo AI Event konnte nicht gesendet werden:",
                error
            );


        }

    },


    /* =====================================
       LICHTSYSTEM DIREKT ANSPRECHEN
       ===================================== */

    light: {


        idle: function () {


            if (
                window.HalDoLight
            ) {


                window.HalDoLight.idle();

            }

        },


        listening: function () {


            if (
                window.HalDoLight
            ) {


                window.HalDoLight.listening();

            }

        },


        input: function () {


            if (
                window.HalDoLight
            ) {


                window.HalDoLight.input();

            }

        },


        thinking: function () {


            if (
                window.HalDoLight
            ) {


                window.HalDoLight.thinking();

            }

        },


        answering: function () {


            if (
                window.HalDoLight
            ) {


                window.HalDoLight.answering();

            }

        },


        speaking: function () {


            if (
                window.HalDoLight
            ) {


                window.HalDoLight.speaking();

            }

        },


        success: function () {


            if (
                window.HalDoLight
            ) {


                window.HalDoLight.success();

            }

        },


        error: function () {


            if (
                window.HalDoLight
            ) {


                window.HalDoLight.error();

            }

        }

    }

};


/* =========================================
   GLOBAL HALDO AI CORE
   ========================================= */

window.HalDoAICore =
HalDoAICore;


/* =========================================
   START NACH LADEZUSTAND
   ========================================= */

window.addEventListener(
    "load",
    function () {


        HalDoAICore.start();


    },
    {
        once:
        true
    }
);