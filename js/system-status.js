/*
==========================================
HalDo AI OS 18
SYSTEM STATUS
Professional Ultimate Foundation
Version 18.0.0
==========================================
*/

(function () {

    "use strict";

    const HalDoSystemStatus = {

        version: "18.0.0",

        state: "starting",

        modules: {},

        lastCheck: null,


        init() {

            this.check();

            console.log(
                "📡 HalDo System Status bereit"
            );

        },


        exists(name) {

            return (
                typeof window[name] !==
                "undefined"
            );

        },


        check() {

            this.lastCheck =
                new Date();


            this.modules = {

                boot:
                    this.exists(
                        "HalDoBoot"
                    ),

                kernel:
                    this.exists(
                        "HalDoKernel"
                    ),

                system:
                    this.exists(
                        "HalDoSystem"
                    ),

                moduleManager:
                    this.exists(
                        "HalDoModuleManager"
                    ),

                appManager:
                    this.exists(
                        "HalDoAppManager"
                    ),

                storage:
                    this.exists(
                        "HalDoStorage"
                    ),

                ai:
                    this.exists(
                        "HalDoAI"
                    ),

                aiEngine:
                    this.exists(
                        "HalDoAIEngine"
                    ),

                chat:
                    this.exists(
                        "HalDoChat"
                    ),

                speech:
                    this.exists(
                        "HalDoSpeech"
                    ),

                voice:
                    this.exists(
                        "HalDoVoice"
                    ),

                memory:
                    this.exists(
                        "HalDoMemory"
                    ),

                commands:
                    this.exists(
                        "HalDoCommands"
                    ),

                language:
                    this.exists(
                        "HalDoLanguageSystem"
                    )

            };


            const values =
                Object.values(
                    this.modules
                );


            const loaded =
                values.filter(
                    Boolean
                ).length;


            const total =
                values.length;


            if (loaded === total) {

                this.state =
                    "online";

            }
            else if (loaded > 0) {

                this.state =
                    "partial";

            }
            else {

                this.state =
                    "offline";

            }


            return this.getStatus();

        },


        refresh() {

            return this.check();

        },


        getStatus() {

            const values =
                Object.values(
                    this.modules
                );

            return {

                state:
                    this.state,

                loaded:
                    values.filter(
                        Boolean
                    ).length,

                total:
                    values.length,

                modules:
                    this.modules,

                lastCheck:
                    this.lastCheck

            };

        },


        isOnline() {

            return (
                this.state ===
                "online"
            );

        }

    };


    window.HalDoSystemStatus =
        HalDoSystemStatus;


    window.addEventListener(
        "DOMContentLoaded",
        function () {

            setTimeout(
                function () {

                    HalDoSystemStatus.init();

                },
                300
            );

        }
    );

})();