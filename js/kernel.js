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

        bootTime: null,

        modules: {},

        events: {},


        init() {

            this.bootTime =
                new Date();

            this.status =
                "running";

            console.log(
                "🔵 HalDo Kernel gestartet"
            );

            this.emit(
                "kernel:ready"
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
                "🧩 Kernel Modul:",
                name
            );

            this.emit(
                "module:registered",
                name
            );

            return true;

        },


        getModule(name) {

            return (
                this.modules[name]
                ||
                null
            );

        },


        hasModule(name) {

            return !!this.modules[name];

        },


        on(
            event,
            callback
        ) {

            if (
                typeof callback !==
                "function"
            ) {

                return;

            }

            if (!this.events[event]) {

                this.events[event] =
                    [];

            }

            this.events[event]
                .push(callback);

        },


        emit(
            event,
            data
        ) {

            const listeners =
                this.events[event]
                ||
                [];

            listeners.forEach(
                function (callback) {

                    try {

                        callback(data);

                    }
                    catch (error) {

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

                name:
                    this.name,

                version:
                    this.version,

                status:
                    this.status,

                bootTime:
                    this.bootTime,

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

            HalDoKernel.init();

        }
    );

})();