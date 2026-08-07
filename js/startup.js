/*
==========================================
HalDo AI OS 18
STARTUP CONTROLLER
Professional Ultimate Foundation
Version 18.0.0
==========================================
*/

(function () {

    "use strict";


    const HalDoStartup = {

        started: false,

        introFinished: false,

        welcomeFinished: false,


        init() {

            if (this.started) {
                return;
            }

            this.started = true;

            console.log(
                "🚀 HalDo AI OS 18 Startup"
            );

            this.startLogoIntro();

        },


        startLogoIntro() {

            const startup =
                document.getElementById(
                    "startup-screen"
                );


            if (!startup) {

                this.showWelcome();

                return;

            }


            const logo =
                startup.querySelector(
                    ".logo"
                );


            if (logo) {

                logo.src =
                    "assets/logo/logo.png";

                logo.classList.add(
                    "haldo-logo-intro"
                );

            }


            startup.classList.remove(
                "hidden"
            );


            startup.style.display =
                "flex";


            this.status(
                "🟡 HalDo AI OS startet..."
            );


            setTimeout(
                () => {

                    this.status(
                        "✨ HalDo AI OS lädt..."
                    );

                },
                900
            );


            setTimeout(
                () => {

                    this.status(
                        "🔵 HalDo AI OS lädt Module..."
                    );

                },
                1800
            );


            setTimeout(
                () => {

                    this.status(
                        "🔵 HalDo AI OS verbindet Systeme..."
                    );

                },
                2700
            );


            setTimeout(
                () => {

                    this.introFinished =
                        true;

                    this.showWelcome();

                },
                4000
            );

        },


        showWelcome() {

            const startup =
                document.getElementById(
                    "startup-screen"
                );


            const welcome =
                document.getElementById(
                    "welcome-screen"
                );


            if (startup) {

                startup.style.display =
                    "none";

            }


            if (!welcome) {

                this.showMainMenu();

                return;

            }


            const logo =
                welcome.querySelector(
                    ".logo"
                );


            if (logo) {

                logo.src =
                    "assets/logo/logo.png";

            }


            welcome.classList.remove(
                "hidden"
            );


            welcome.style.display =
                "flex";


            this.welcomeFinished =
                true;


            this.welcomeVoice();

        },


        welcomeVoice() {

            if (
                !window.HalDoVoice
            ) {

                return;

            }


            if (
                typeof HalDoVoice.speak !==
                "function"
            ) {

                return;

            }


            setTimeout(
                function () {

                    try {

                        HalDoVoice.speak(
                            "Willkommen bei HalDo AI OS 18."
                        );

                    } catch (error) {

                        console.log(
                            "HalDo Voice momentan nicht verfügbar."
                        );

                    }

                },
                600
            );

        },


        openMainMenu() {

            this.showMainMenu();

        },


        showMainMenu() {

            const welcome =
                document.getElementById(
                    "welcome-screen"
                );


            const menu =
                document.getElementById(
                    "main-menu"
                );


            if (welcome) {

                welcome.style.display =
                    "none";

            }


            if (!menu) {

                return;

            }


            menu.classList.remove(
                "hidden"
            );


            menu.style.display =
                "block";


            this.applyLogo();

        },


        applyLogo() {

            document
                .querySelectorAll(
                    ".logo"
                )
                .forEach(
                    function (image) {

                        image.src =
                            "assets/logo/logo.png";

                    }
                );

        },


        status(message) {

            const element =
                document.getElementById(
                    "system-status"
                );


            if (element) {

                element.textContent =
                    message;

            }

        },


        getStatus() {

            return {

                started:
                    this.started,

                introFinished:
                    this.introFinished,

                welcomeFinished:
                    this.welcomeFinished

            };

        }

    };


    window.HalDoStartup =
        HalDoStartup;


    window.openMainMenu =
        function () {

            HalDoStartup
                .openMainMenu();

        };


    window.addEventListener(
        "DOMContentLoaded",
        function () {

            setTimeout(
                function () {

                    HalDoStartup.init();

                },
                500
            );

        }
    );

})();