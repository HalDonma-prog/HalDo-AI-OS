/*
==========================================
HalDo AI OS 18
BOOT SYSTEM
Professional Ultimate Foundation
Version 18.0.0
==========================================
*/

(function () {

    "use strict";

    const HalDoBoot = {

        name: "HalDo Boot",
        version: "18.0.0",
        status: "starting",
        startedAt: null,

        init() {

            if (this.status === "running") {
                return true;
            }

            this.startedAt = new Date();
            this.status = "running";

            this.updateStatus(
                "🟡 HalDo AI OS startet..."
            );

            console.log(
                "🟡 HalDo AI OS Boot gestartet"
            );

            window.dispatchEvent(
                new CustomEvent(
                    "haldo:boot-start"
                )
            );

            return true;
        },

        updateStatus(message) {

            const element =
                document.getElementById(
                    "system-status"
                );

            if (element) {
                element.textContent = message;
            }

            console.log(message);
        },

        ready() {

            this.status = "ready";

            this.updateStatus(
                "🟢 HalDo AI OS Boot bereit."
            );

            window.dispatchEvent(
                new CustomEvent(
                    "haldo:boot-ready"
                )
            );

        },

        getStatus() {

            return {
                name: this.name,
                version: this.version,
                status: this.status,
                startedAt: this.startedAt
            };

        }

    };


    window.HalDoBoot = HalDoBoot;


    window.addEventListener(
        "DOMContentLoaded",
        function () {

            HalDoBoot.init();

        }
    );

})();