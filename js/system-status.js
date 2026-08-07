/*
==========================================
HalDo AI OS 18
System Status Manager

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

        check() {

            this.lastCheck =
                new Date();

            this.modules = {

                boot:
                    this.exists("HalDoBoot"),

                kernel:
                    this.exists("HalDoKernel"),

                system:
                    this.exists("HalDoSystem"),

                ai:
                    this.exists("HalDoAI"),

                chat:
                    this.exists("HalDoChat"),

                speech:
                    this.exists("HalDoSpeech"),

                voice:
                    this.exists("HalDoVoice"),

                memory:
                    this.exists("HalDoMemory"),

                commands:
                    this.exists("HalDoCommands"),

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
                    value => value
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

        exists(name) {

            return (
                typeof window[name] !==
                "undefined"
            );

        },

        getStatus() {

            return {

                state:
                    this.state,

                modules:
                    this.modules,

                lastCheck:
                    this.lastCheck,

                loaded:
                    Object.values(
                        this.modules
                    ).filter(
                        value => value
                    ).length,

                total:
                    Object.keys(
                        this.modules
                    ).length

            };

        },

        isOnline() {

            return (
                this.state ===
                "online"
            );

        },

        getModuleStatus(name) {

            return !!this.modules[name];

        },

        refresh() {

            return this.check();

        }

    };

    window.HalDoSystemStatus =
        HalDoSystemStatus;

    window.addEventListener(
        "DOMContentLoaded",
        function () {

            HalDoSystemStatus.init();

        }
    );

})();