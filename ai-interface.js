(function () {

    "use strict";

    const AIInterface = {

        initialized: false,

        currentMessage: "",

        responseTimer: null,


        init() {

            this.initialized = true;

            if (window.HalDoSystem) {

                window.HalDoSystem.log(
                    "AI",
                    "HalDo AI Interface bereit."
                );

            }

            return true;
        },


        async send(message) {

            if (!message || !message.trim()) {
                return null;
            }

            this.currentMessage =
                message.trim();


            /*
             * 1. HalDo hört zu
             */

            this.setState("LISTENING");


            await this.delay(600);


            /*
             * 2. HalDo verarbeitet
             */

            this.setState("THINKING");


            await this.delay(900);


            /*
             * 3. Foundation-Antwort
             *
             * Noch KEINE erfundene externe KI.
             * Hier wird später die echte AI Engine
             * angeschlossen.
             */

            const response =
                this.createFoundationResponse(
                    this.currentMessage
                );


            /*
             * 4. HalDo antwortet
             */

            this.setState("SPEAKING");


            await this.delay(700);


            /*
             * 5. Gespräch beendet
             */

            this.setState("READY");


            return response;
        },


        setState(state) {

            if (
                window.HalDoConversation
            ) {

                window.HalDoConversation
                    .setState(state);

            }

        },


        createFoundationResponse(message) {

            const normalized =
                message.toLowerCase();


            if (
                normalized.includes(
                    "hallo"
                ) ||
                normalized.includes(
                    "hi"
                ) ||
                normalized.includes(
                    "hey"
                )
            ) {

                return {
                    text:
                        "Hallo. Ich bin HalDo AI. Meine Foundation ist bereit.",
                    type:
                        "foundation"
                };

            }


            if (
                normalized.includes(
                    "wer bist"
                )
            ) {

                return {
                    text:
                        "Ich bin HalDo AI – die intelligente Foundation von HalDo AI OS 18.",
                    type:
                        "foundation"
                };

            }


            if (
                normalized.includes(
                    "status"
                )
            ) {

                const status =
                    window.HalDoSystem
                        ? window.HalDoSystem.getStatus()
                        : null;


                return {
                    text:
                        `HalDo AI OS 18 ist ${status?.status || "bereit"}.`,
                    type:
                        "system"
                };

            }


            return {
                text:
                    "Deine Nachricht wurde von der HalDo AI Foundation empfangen. Die vollständige KI-Engine wird als nächstes angeschlossen.",
                type:
                    "foundation"
            };

        },


        delay(milliseconds) {

            return new Promise(
                resolve =>
                    setTimeout(
                        resolve,
                        milliseconds
                    )
            );

        }

    };


    window.HalDoAI =
        AIInterface;


})();