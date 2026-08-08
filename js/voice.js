/*
========================================================

HalDo AI OS 18
Voice System

Professional Ultimate Foundation

Version:
18.0.0

Aufgaben:
- Mikrofon starten
- Sprache erkennen
- AI Core informieren
- Lichtsystem steuern
- Voice-Zustände verwalten
- Vorbereitung für mehrsprachige Eingabe

========================================================
*/


const HalDoVoice = {


    /* ==================================================
       GRUNDINFORMATIONEN
       ================================================== */

    name:
        "HalDo Voice System",


    version:
        "18.0.0",


    status:
        "ready",


    listening:
        false,


    supported:
        false,


    recognition:
        null,


    language:
        "de-DE",


    lastTranscript:
        "",



    /* ==================================================
       INITIALISIERUNG
       ================================================== */

    init: function () {


        const SpeechRecognition =
            window.SpeechRecognition ||
            window.webkitSpeechRecognition;


        if (
            !SpeechRecognition
        ) {


            this.supported =
                false;


            console.warn(
                "HalDo Voice: Spracherkennung wird von diesem Browser nicht unterstützt."
            );


            return false;

        }


        this.supported =
            true;


        this.recognition =
            new SpeechRecognition();


        this.recognition.continuous =
            false;


        this.recognition.interimResults =
            true;


        this.recognition.lang =
            this.language;


        this.setupEvents();


        console.log(
            "HalDo Voice System bereit."
        );


        return true;

    },



    /* ==================================================
       EVENTS
       ================================================== */

    setupEvents: function () {


        if (
            !this.recognition
        ) {

            return;

        }


        /*
        ----------------------------------------------
        START
        ----------------------------------------------
        */

        this.recognition.onstart =
            function () {


                this.listening =
                    true;


                this.status =
                    "listening";


                this.setLight(
                    "listening"
                );


                this.dispatch(
                    "voice-start"
                );


                console.log(
                    "HalDo Voice hört zu."
                );


            }.bind(this);



        /*
        ----------------------------------------------
        RESULT
        ----------------------------------------------
        */

        this.recognition.onresult =
            function (
                event
            ) {


                let transcript =
                    "";


                for (
                    let i =
                        event.resultIndex;

                    i <
                        event.results.length;

                    i++
                ) {


                    transcript +=
                        event.results[i][0]
                            .transcript;

                }


                transcript =
                    transcript.trim();


                if (
                    transcript
                ) {


                    this.lastTranscript =
                        transcript;


                    this.setLight(
                        "input"
                    );


                    this.dispatch(
                        "voice-result",
                        {
                            transcript:
                                transcript
                        }
                    );


                }


                /*
                --------------------------------------
                FERTIGES ERGEBNIS
                --------------------------------------
                */

                const finalResult =
                    event.results[
                        event.results.length - 1
                    ];


                if (
                    finalResult &&
                    finalResult.isFinal
                ) {


                    this.processTranscript(
                        transcript
                    );

                }


            }.bind(this);



        /*
        ----------------------------------------------
        END
        ----------------------------------------------
        */

        this.recognition.onend =
            function () {


                this.listening =
                    false;


                if (
                    this.status !==
                    "error"
                ) {


                    this.status =
                        "ready";


                }


                this.dispatch(
                    "voice-end"
                );


            }.bind(this);



        /*
        ----------------------------------------------
        ERROR
        ----------------------------------------------
        */

        this.recognition.onerror =
            function (
                event
            ) {


                this.listening =
                    false;


                this.status =
                    "error";


                this.setLight(
                    "error"
                );


                console.error(
                    "HalDo Voice Fehler:",
                    event.error
                );


                this.dispatch(
                    "voice-error",
                    {
                        error:
                            event.error
                    }
                );


            }.bind(this);

    },



    /* ==================================================
       MIKROFON STARTEN
       ================================================== */

    start: function () {


        if (
            !this.supported
        ) {


            this.init();


        }


        if (
            !this.recognition
        ) {


            this.setLight(
                "error"
            );


            return false;

        }


        if (
            this.listening
        ) {


            return true;

        }


        try {


            this.setLight(
                "listening"
            );


            this.recognition.start();


            return true;


        } catch (
            error
        ) {


            console.warn(
                "HalDo Voice konnte nicht gestartet werden:",
                error
            );


            this.setLight(
                "error"
            );


            return false;

        }

    },



    /* ==================================================
       MIKROFON STOPPEN
       ================================================== */

    stop: function () {


        if (
            !this.recognition
        ) {


            return false;

        }


        try {


            this.recognition.stop();


            this.listening =
                false;


            this.status =
                "ready";


            this.setLight(
                "idle"
            );


            return true;


        } catch (
            error
        ) {


            console.warn(
                "HalDo Voice konnte nicht gestoppt werden:",
                error
            );


            return false;

        }

    },



    /* ==================================================
       TRANSKRIPT VERARBEITEN
       ================================================== */

    processTranscript: function (
        transcript
    ) {


        if (
            !transcript
        ) {


            this.setLight(
                "idle"
            );


            return null;

        }


        const text =
            String(
                transcript
            ).trim();


        this.status =
            "processing";


        this.setLight(
            "thinking"
        );


        /*
        ----------------------------------------------
        AI CORE
        ----------------------------------------------
        */

        if (
            window.HalDoAICore
        ) {


            try {


                const result =
                    window.HalDoAICore.ask(
                        text
                    );


                this.dispatch(
                    "ai-request",
                    {
                        input:
                            text,

                        result:
                            result
                    }
                );


                return result;


            } catch (
                error
            ) {


                console.error(
                    "HalDo Voice → AI Core Fehler:",
                    error
                );


                this.setLight(
                    "error"
                );


                return null;

            }

        }


        /*
        ----------------------------------------------
        FALLBACK
        ----------------------------------------------
        */

        this.dispatch(
            "ai-request",
            {
                input:
                    text
            }
        );


        return {


            input:
                text,


            status:
                "received"

        };

    },



    /* ==================================================
       SPRACHE SETZEN
       ================================================== */

    setLanguage: function (
        language
    ) {


        if (
            !language
        ) {


            return false;

        }


        this.language =
            String(
                language
            );


        if (
            this.recognition
        ) {


            this.recognition.lang =
                this.language;


        }


        /*
        ----------------------------------------------
        AI CORE ebenfalls informieren
        ----------------------------------------------
        */

        if (
            window.HalDoAICore &&
            typeof window.HalDoAICore.setLanguage ===
                "function"
        ) {


            window.HalDoAICore.setLanguage(
                this.language
            );


        }


        this.dispatch(
            "language-change",
            {
                language:
                    this.language
            }
        );


        return true;

    },



    /* ==================================================
       LICHTSYSTEM
       ================================================== */

    setLight: function (
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



    /* ==================================================
       EVENT SYSTEM
       ================================================== */

    dispatch: function (
        name,
        detail
    ) {


        try {


            window.dispatchEvent(
                new CustomEvent(
                    "haldo-voice-" +
                    name,
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
                "HalDo Voice Event Fehler:",
                error
            );


        }

    },



    /* ==================================================
       STATUS
       ================================================== */

    getStatus: function () {


        return {


            name:
                this.name,


            version:
                this.version,


            status:
                this.status,


            listening:
                this.listening,


            supported:
                this.supported,


            language:
                this.language,


            lastTranscript:
                this.lastTranscript

        };

    }

};


/* ======================================================
   GLOBAL
   ====================================================== */

window.HalDoVoice =
    HalDoVoice;



/* ======================================================
   AUTOMATISCHE INITIALISIERUNG
   ====================================================== */

window.addEventListener(
    "load",
    function () {


        HalDoVoice.init();


    },
    {
        once:
            true
    }
);