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

        logoIntroFinished: false,

        welcomeFinished: false,


        init() {

            if (this.started) {

                return;

            }


            this.started =
                true;


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


            const welcome =
                document.getElementById(
                    "welcome-screen"
                );


            const logo =
                startup
                ? startup.querySelector(
                    ".logo"
                )
                : null;


            if (!startup) {

                this.showWelcome();

                return;

            }


            startup.style.display =
                "flex";


            startup.classList.remove(
                "hidden"
            );


            if (logo) {

                logo.classList.add(
                    "haldo-logo-intro"
                );

            }


            this.setStatus(
                "🟡 HalDo AI OS startet..."
            );


            setTimeout(
                () => {

                    this.setStatus(
                        "✨ HalDo AI OS lädt..."
                    );

                },
                900
            );


            setTimeout(
                () => {

                    this.setStatus(
                        "🔵 HalDo AI OS lädt Module..."
                    );

                },
                1800
            );


            setTimeout(
                () => {

                    this.setStatus(
                        "🔵 HalDo AI OS verbindet Systeme..."
                    );

                },
                2700
            );


            setTimeout(
                () => {

                    this.logoIntroFinished =
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


            welcome.classList.remove(
                "hidden"
            );


            welcome.style.display =
                "flex";


            this.welcomeFinished =
                true;


            this.startWelcomeVoice();

        },


        startWelcomeVoice() {

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

                    }
                    catch (error) {

                        console.log(
                            "Voice nicht verfügbar."
                        );

                    }

                },
                700
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


            this.applyLogoToMenu();

        },


        applyLogoToMenu() {

            const images =
                document.querySelectorAll(
                    ".logo"
                );


            images.forEach(
                function (image) {

                    image.src =
                        "assets/logo/logo.png";

                }
            );

        },


        setStatus(message) {

            const status =
                document.getElementById(
                    "system-status"
                );


            if (status) {

                status.textContent =
                    message;

            }

        }

    };


    window.HalDoStartup =
        HalDoStartup;


    /*
    ======================================
    GLOBAL BUTTON
    ======================================
    */

    window.openMainMenu =
        function () {

            HalDoStartup
                .openMainMenu();

        };


    /*
    ======================================
    STARTUP
    ======================================
    */

    window.addEventListener(
        "DOMContentLoaded",
        function () {

            setTimeout(
                function () {

                    HalDoStartup.init();

                },
                150
            );

        }
    );

})();