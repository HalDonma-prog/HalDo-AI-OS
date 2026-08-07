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

        steps: [],

        startedAt: null,


        init() {

            if (
                this.status ===
                "ready"
            ) {

                return true;

            }


            this.status =
                "loading";

            this.startedAt =
                new Date();

            this.steps = [];


            this.message(
                "🔵 HalDo AI OS lädt Module..."
            );


            this.check(
                "Boot",
                "HalDoBoot"
            );


            this.check(
                "Kernel",
                "HalDoKernel"
            );


            this.check(
                "System",
                "HalDoSystem"
            );


            this.check(
                "Module Manager",
                "HalDoModuleManager"
            );


            this.check(
                "App Manager",
                "HalDoAppManager"
            );


            this.check(
                "Storage",
                "HalDoStorage"
            );


            this.check(
                "System Status",
                "HalDoSystemStatus"
            );


            this.status =
                "ready";


            this.message(
                "🟢 HalDo AI OS ist bereit."
            );


            window.dispatchEvent(
                new CustomEvent(
                    "haldo:loader-ready"
                )
            );


            return true;

        },


        check(
            name,
            globalName
        ) {

            const loaded =
                typeof window[
                    globalName
                ] !== "undefined";


            this.steps.push({

                name:
                    name,

                global:
                    globalName,

                loaded:
                    loaded

            });


            console.log(
                loaded
                    ? "🟢"
                    : "🟡",
                name
            );


            return loaded;

        },


        message(text) {

            const element =
                document.getElementById(
                    "system-status"
                );


            if (element) {

                element.textContent =
                    text;

            }


            console.log(text);

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
                400
            );

        }
    );

})();