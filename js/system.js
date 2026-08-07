/*
==========================================
HalDo AI OS 18
SYSTEM MANAGER
Professional Ultimate Foundation
Version 18.0.0
==========================================
*/

(function () {

    "use strict";


    const HalDoSystem = {

        name:
            "HalDo AI OS System",

        version:
            "18.0.0",

        status:
            "starting",

        startedAt:
            null,

        services: {},


        init() {

            this.startedAt =
                new Date();

            this.status =
                "running";


            console.log(
                "🔵 HalDo AI OS System gestartet"
            );


            this.registerCoreServices();


            if (
                window.HalDoKernel
            ) {

                HalDoKernel.registerModule(
                    "system",
                    this
                );

            }


            return true;

        },


        registerCoreServices() {

            this.services = {

                kernel:
                    !!window.HalDoKernel,

                storage:
                    !!window.HalDoStorage,

                modules:
                    !!window.HalDoModuleManager,

                ai:
                    !!window.HalDoAI,

                language:
                    !!window.HalDoLanguageSystem,

                memory:
                    !!window.HalDoMemory,

                speech:
                    !!window.HalDoSpeech,

                voice:
                    !!window.HalDoVoice

            };

        },


        refresh() {

            this.registerCoreServices();

            return this.getStatus();

        },


        getStatus() {

            const services =
                this.services;


            const values =
                Object.values(
                    services
                );


            const loaded =
                values.filter(
                    Boolean
                ).length;


            return {

                name:
                    this.name,

                version:
                    this.version,

                status:
                    this.status,

                loaded:

                    loaded,

                total:

                    values.length,

                services:

                    services,

                startedAt:

                    this.startedAt

            };

        },


        isReady() {

            return (
                this.status ===
                "running"
            );

        },


        shutdown() {

            this.status =
                "stopped";


            console.log(
                "🟡 HalDo System gestoppt"
            );

        }

    };


    window.HalDoSystem =
        HalDoSystem;


    window.addEventListener(
        "DOMContentLoaded",
        function () {

            setTimeout(
                function () {

                    HalDoSystem.init();

                },
                50
            );

        }
    );

})();