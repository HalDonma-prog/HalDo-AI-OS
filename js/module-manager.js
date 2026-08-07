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
        version:
            "18.0.0",
        modules: {},
        status:
            "starting",
        init() {
            this.status =
                "running";
            console.log(
                "🧩 HalDo Module Manager gestartet"
            );
            this.detectCoreModules();
            if (
                window.HalDoKernel
            ) {
                HalDoKernel.registerModule(
                    "module-manager",
                    this
                );
            }
            return true;
        },
        detectCoreModules() {
            this.registerDetected(
                "kernel",
                "HalDoKernel"
            );
            this.registerDetected(
                "system",
                "HalDoSystem"
            );
            this.registerDetected(
                "storage",
                "HalDoStorage"
            );
            this.registerDetected(
                "ai",
                "HalDoAI"
            );
            this.registerDetected(
                "memory",
                "HalDoMemory"
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
                "language",
                "HalDoLanguageSystem"
            );
            this.registerDetected(
                "commands",
                "HalDoCommands"
            );
        },
        registerDetected(
            id,
            globalName
        ) {
            if (
                typeof window[globalName] ===
                "undefined"
            ) {
                this.modules[id] = {
                    id:
                        id,
                    global:
                        globalName,
                    status:
                        "not-loaded"
                };
                return false;
            }
            this.modules[id] = {
                id:
                    id,
                global:
                    globalName,
                status:
                    "loaded",
                object:
                    window[globalName]
            };
            console.log(
                "🟢 Modul geladen:",
                id
            );
            return true;
        },
        register(
            id,
            module
        ) {
            if (!id) {
                return false;
            }
            this.modules[id] = {
                id:
                    id,
                global:
                    null,
                status:
                    "loaded",
                object:
                    module
            };
            if (
                window.HalDoKernel
            ) {
                HalDoKernel.registerModule(
                    id,
                    module
                );
            }
            return true;
        },
        get(id) {
            return (
                this.modules[id]
                ||
                null
            );
        },
        isLoaded(id) {
            return (
                this.modules[id]
                &&
                this.modules[id]
                    .status ===
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
            return {
                status:
                    this.status,
                loaded:
                    loaded,
                total:
                    list.length,
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
                100
            );
        }
    );
})();