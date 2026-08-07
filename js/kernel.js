/*
==========================================
HalDo AI OS 18
KERNEL
Professional Ultimate Foundation
Version 18.0.0
==========================================
*/

(function () {

    "use strict";

    const HalDoKernel = {

        name: "HalDo Kernel",
        version: "18.0.0",

        status: "starting",

        startedAt: null,

        modules: {},

        events: {},


        init() {

            if (this.status === "running") {
                return true;
            }

            this.startedAt = new Date();
            this.status = "running";

            console.log(
                "🔵 HalDo Kernel gestartet"
            );

            this.emit(
                "kernel:ready",
                this.getStatus()
            );

            return true;
        },


        registerModule(
            name,
            module
        ) {

            if (!name) {
                return false;
            }

            this.modules[name] =
                module || {};

            console.log(
                "🧩 Kernel Modul registriert:",
                name
            );

            this.emit(
                "module:registered",
                {
                    name: name,
                    module: module
                }
            );

            return true;
        },


        unregisterModule(name) {

            if (!this.modules[name]) {
                return false;
            }

            delete this.modules[name];

            this.emit(
                "module:unregistered",
                name
            );

            return true;
        },


        getModule(name) {

            return (
                this.modules[name] ||
                null
            );
        },


        hasModule(name) {

            return !!this.modules[name];
        },


        on(event, callback) {

            if (
                typeof callback !==
                "function"
            ) {
                return false;
            }

            if (!this.events[event]) {
                this.events[event] = [];
            }

            this.events[event].push(
                callback
            );

            return true;
        },


        emit(event, data) {

            const listeners =
                this.events[event] || [];

            listeners.forEach(
                function (callback) {

                    try {

                        callback(data);

                    } catch (error) {

                        console.error(
                            "HalDo Kernel Event Error:",
                            error
                        );

                    }

                }
            );

        },


        getStatus() {

            return {

                name: this.name,

                version: this.version,

                status: this.status,

                startedAt:
                    this.startedAt,

                moduleCount:
                    Object.keys(
                        this.modules
                    ).length,

                modules:
                    Object.keys(
                        this.modules
                    )

            };

        }

    };


    window.HalDoKernel =
        HalDoKernel;


    window.addEventListener(
        "DOMContentLoaded",
        function () {

            setTimeout(
                function () {

                    HalDoKernel.init();

                },
                25
            );

        }
    );

})();