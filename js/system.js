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

        name: "HalDo AI OS System",
        version: "18.0.0",

        status: "starting",

        startedAt: null,

        services: {},


        init() {

            if (this.status === "running") {
                return true;
            }

            this.startedAt = new Date();
            this.status = "running";

            this.refresh();

            if (window.HalDoKernel) {

                HalDoKernel.registerModule(
                    "system",
                    this
                );

            }

            console.log(
                "🔵 HalDo AI OS System gestartet"
            );

            window.dispatchEvent(
                new CustomEvent(
                    "haldo:system-ready"
                )
            );

            return true;
        },


        refresh() {

            this.services = {

                kernel:
                    !!window.HalDoKernel,

                boot:
                    !!window.HalDoBoot,

                storage:
                    !!window.HalDoStorage,

                moduleManager:
                    !!window.HalDoModuleManager,

                appManager:
                    !!window.HalDoAppManager,

                ai:
                    !!window.HalDoAI,

                aiEngine:
                    !!window.HalDoAIEngine,

                chat:
                    !!window.HalDoChat,

                speech:
                    !!window.HalDoSpeech,

                voice:
                    !!window.HalDoVoice,

                memory:
                    !!window.HalDoMemory,

                commands:
                    !!window.HalDoCommands,

                language:
                    !!window.HalDoLanguageSystem

            };

            return this.services;
        },


        getStatus() {

            const values =
                Object.values(
                    this.services
                );

            const loaded =
                values.filter(
                    Boolean
                ).length;

            return {

                name: this.name,

                version: this.version,

                status: this.status,

                startedAt:
                    this.startedAt,

                loaded: loaded,

                total:
                    values.length,

                services:
                    this.services

            };

        },


        isReady() {

            return (
                this.status ===
                "running"
            );

        },


        registerService(
            name,
            service
        ) {

            if (!name) {
                return false;
            }

            this.services[name] =
                !!service;

            return true;
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
                75
            );

        }
    );

})();