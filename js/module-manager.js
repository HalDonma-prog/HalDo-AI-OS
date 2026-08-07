/*
==========================================
HalDo AI OS 18
MODULE MANAGER
Professional Ultimate Foundation
Version 18.0.0
==========================================
*/

(function () {

    "use strict";

    const HalDoModuleManager = {

        name: "HalDo Module Manager",
        version: "18.0.0",

        status: "starting",

        modules: {},


        init() {

            if (this.status === "running") {
                return true;
            }

            this.status = "running";

            this.detectCoreModules();

            if (window.HalDoKernel) {

                HalDoKernel.registerModule(
                    "module-manager",
                    this
                );

            }

            console.log(
                "🧩 HalDo Module Manager gestartet"
            );

            return true;
        },


        register(
            id,
            module,
            options = {}
        ) {

            if (!id) {
                return false;
            }

            this.modules[id] = {

                id: id,

                status: "loaded",

                object:
                    module || null,

                required:
                    options.required === true,

                version:
                    options.version ||
                    "18.0.0"

            };

            if (window.HalDoKernel) {

                HalDoKernel.registerModule(
                    id,
                    module
                );

            }

            return true;
        },


        registerDetected(
            id,
            globalName,
            options = {}
        ) {

            const exists =
                typeof window[
                    globalName
                ] !== "undefined";

            this.modules[id] = {

                id: id,

                global:
                    globalName,

                status:
                    exists
                    ? "loaded"
                    : "not-loaded",

                object:
                    exists
                    ? window[globalName]
                    : null,

                required:
                    options.required === true,

                version:
                    options.version ||
                    "18.0.0"

            };

            return exists;
        },


        detectCoreModules() {

            this.registerDetected(
                "boot",
                "HalDoBoot",
                {
                    required: true
                }
            );

            this.registerDetected(
                "kernel",
                "HalDoKernel",
                {
                    required: true
                }
            );

            this.registerDetected(
                "system",
                "HalDoSystem",
                {
                    required: true
                }
            );

            this.registerDetected(
                "storage",
                "HalDoStorage"
            );

            this.registerDetected(
                "app-manager",
                "HalDoAppManager"
            );

            this.registerDetected(
                "ai",
                "HalDoAI"
            );

            this.registerDetected(
                "ai-engine",
                "HalDoAIEngine"
            );

            this.registerDetected(
                "chat",
                "HalDoChat"
            );

            this.registerDetected(
                "speech",
                "HalDoSpeech"
            );

            this.registerDetected(
                "voice",
                "HalDoVoice"
            );

            this.registerDetected(
                "memory",
                "HalDoMemory"
            );

            this.registerDetected(
                "commands",
                "HalDoCommands"
            );

            this.registerDetected(
                "language",
                "HalDoLanguageSystem"
            );

        },


        get(id) {

            return (
                this.modules[id] ||
                null
            );

        },


        isLoaded(id) {

            return (
                !!this.modules[id] &&
                this.modules[id].status ===
                "loaded"
            );

        },


        refresh() {

            this.detectCoreModules();

            return this.getStatus();

        },


        getStatus() {

            const list =
                Object.values(
                    this.modules
                );

            const loaded =
                list.filter(
                    module =>
                        module.status ===
                        "loaded"
                ).length;

            const required =
                list.filter(
                    module =>
                        module.required ===
                        true
                );

            const requiredLoaded =
                required.filter(
                    module =>
                        module.status ===
                        "loaded"
                ).length;

            return {

                status:
                    this.status,

                loaded:
                    loaded,

                total:
                    list.length,

                required:
                    required.length,

                requiredLoaded:
                    requiredLoaded,

                modules:
                    this.modules

            };

        }

    };


    window.HalDoModuleManager =
        HalDoModuleManager;


    window.addEventListener(
        "DOMContentLoaded",
        function () {

            setTimeout(
                function () {

                    HalDoModuleManager.init();

                },
                125
            );

        }
    );

})();