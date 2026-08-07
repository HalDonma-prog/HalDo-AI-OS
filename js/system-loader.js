/*
==========================================
HalDo AI OS 18
SYSTEM LOADER
Professional Ultimate Foundation
Version 18.0.0
==========================================
*/

(function () {

    "use strict";


    const HalDoSystemLoader = {

        status: "waiting",

        startedAt: null,

        steps: [],


        init() {

            this.status =
                "loading";

            this.startedAt =
                new Date();

            this.steps = [];


            this.update(
                "🔵 HalDo AI OS lädt Module..."
            );


            this.checkModules();


            this.status =
                "ready";


            this.update(
                "🟢 HalDo AI OS ist bereit."
            );


            if (
                window.HalDoKernel
            ) {

                HalDoKernel.emit(
                    "system-loader:ready"
                );

            }

        },


        checkModules() {

            const modules = [

                "HalDoKernel",

                "HalDoSystem",

                "HalDoModuleManager",

                "HalDoSystemStatus"

            ];


            modules.forEach(
                (name) => {

                    const loaded =
                        typeof window[name] !==
                        "undefined";


                    this.steps.push({

                        name:
                            name,

                        loaded:
                            loaded

                    });


                    console.log(

                        loaded
                        ? "🟢"
                        : "🟡",

                        name

                    );

                }
            );

        },


        update(message) {

            const status =
                document.getElementById(
                    "system-status"
                );


            if (status) {

                status.textContent =
                    message;

            }


            console.log(
                message
            );

        },


        getStatus() {

            return {

                status:
                    this.status,

                steps:
                    this.steps,

                startedAt:
                    this.startedAt

            };

        }

    };


    window.HalDoSystemLoader =
        HalDoSystemLoader;


    window.addEventListener(
        "DOMContentLoaded",
        function () {

            setTimeout(
                function () {

                    HalDoSystemLoader.init();

                },
                250
            );

        }
    );

})();