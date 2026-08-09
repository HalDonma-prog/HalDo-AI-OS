/* =========================================================
   HalDo AI OS 18
   CONVERSATION STATE ENGINE
========================================================= */

(function () {

    "use strict";

    const ConversationState = {

        states: {
            IDLE: "IDLE",
            LISTENING: "LISTENING",
            THINKING: "THINKING",
            SPEAKING: "SPEAKING",
            READY: "READY"
        },

        current:
            "IDLE",

        previous:
            null,

        listeners: [],


        init() {

            this.current =
                this.states.IDLE;

            this.previous =
                null;

            this.notify();

            if (window.HalDoSystem) {

                window.HalDoSystem.log(
                    "CONVERSATION",
                    "Conversation State Engine bereit."
                );

            }

            return true;
        },


        setState(newState) {

            if (
                !Object.values(this.states)
                    .includes(newState)
            ) {

                console.warn(
                    "HalDo: Unbekannter Conversation State:",
                    newState
                );

                return false;
            }


            if (
                this.current === newState
            ) {

                return true;
            }


            this.previous =
                this.current;

            this.current =
                newState;


            if (window.HalDoSystem) {

                window.HalDoSystem.log(
                    "CONVERSATION",
                    `${this.previous} → ${this.current}`
                );

            }


            this.notify();

            return true;
        },


        getState() {

            return this.current;
        },


        getPreviousState() {

            return this.previous;
        },


        is(state) {

            return this.current === state;
        },


        onChange(callback) {

            if (
                typeof callback !==
                "function"
            ) {

                return false;
            }


            this.listeners.push(
                callback
            );


            return true;
        },


        notify() {

            this.listeners.forEach(
                callback => {

                    try {

                        callback(
                            this.current,
                            this.previous
                        );

                    } catch (error) {

                        console.error(
                            "HalDo Conversation Listener:",
                            error
                        );

                    }

                }
            );

        }

    };


    window.HalDoConversation =
        ConversationState;


})();