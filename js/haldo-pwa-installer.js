/*
 * ============================================================
 * HALDO AI OS 20
 * HALDO PWA INSTALLER MANAGER
 * ============================================================
 *
 * Verantwortlich für:
 *
 * - Erkennen, ob HalDo als PWA installierbar ist
 * - beforeinstallprompt verwalten
 * - Installationsdialog auslösen
 * - iOS-/iPadOS-Hinweise
 * - Standalone-Erkennung
 * - Installationsstatus
 * - App-Installationsereignisse
 * - Verbindung mit HalDo System / Event Bus
 *
 * Wichtig:
 * Dieser Manager installiert keine fremde Software.
 * Er verwaltet ausschließlich die Installation
 * der HalDo AI OS Web-App als PWA.
 *
 * ============================================================
 */

(function (window) {

    "use strict";


    const HalDoOS =
        window.HalDoOS =
        window.HalDoOS || {};


    const PWAInstaller = {

        name:
            "HalDo PWA Installer Manager",

        version:
            "20.0.0",

        initialized:
            false,

        installPrompt:
            null,

        installAvailable:
            false,

        installed:
            false,

        standalone:
            false,

        ios:
            false,

        ipad:
            false,

        android:
            false,

        desktop:
            false,

        mobile:
            false,

        events:
            {},

        state:
            "idle"

    };


    /* ========================================================
     * EVENT SYSTEM
     * ======================================================== */

    PWAInstaller.on =
        function (
            eventName,
            callback
        ) {

            if (
                typeof callback !==
                "function"
            ) {

                return function () {};

            }


            if (
                !PWAInstaller
                    .events[
                        eventName
                    ]
            ) {

                PWAInstaller
                    .events[
                        eventName
                    ] = [];

            }


            PWAInstaller
                .events[
                    eventName
                ]
                .push(
                    callback
                );


            return function unsubscribe() {

                const listeners =
                    PWAInstaller
                        .events[
                            eventName
                        ];


                if (!listeners) {
                    return;
                }


                const index =
                    listeners.indexOf(
                        callback
                    );


                if (
                    index !==
                    -1
                ) {

                    listeners.splice(
                        index,
                        1
                    );

                }

            };

        };


    PWAInstaller.emit =
        function (
            eventName,
            payload
        ) {

            const listeners =
                PWAInstaller
                    .events[
                        eventName
                    ] || [];


            listeners.forEach(
                function (
                    callback
                ) {

                    try {

                        callback(
                            payload
                        );

                    } catch (error) {

                        console.error(
                            "[HalDo PWA]",
                            error
                        );

                    }

                }
            );


            try {

                if (
                    HalDoOS.events &&
                    typeof HalDoOS
                        .events
                        .emit ===
                    "function"
                ) {

                    HalDoOS.events.emit(
                        eventName,
                        payload
                    );

                }

            } catch (error) {

                console.warn(
                    "[HalDo PWA] Event Bridge:",
                    error
                );

            }


            try {

                window.dispatchEvent(
                    new CustomEvent(
                        eventName,
                        {
                            detail:
                                payload
                        }
                    )
                );

            } catch (error) {

                /* Browser fallback */

            }

        };


    /* ========================================================
     * STATE
     * ======================================================== */

    PWAInstaller.setState =
        function (
            state
        ) {

            PWAInstaller.state =
                state;


            PWAInstaller.emit(
                "pwa:state",
                PWAInstaller
                    .getStatus()
            );


            return state;

        };


    /* ========================================================
     * PLATFORM DETECTION
     * ======================================================== */

    PWAInstaller.detectPlatform =
        function () {

            const userAgent =
                navigator.userAgent ||
                "";


            const platform =
                navigator.platform ||
                "";


            const maxTouchPoints =
                navigator.maxTouchPoints ||
                0;


            PWAInstaller.ios =
                /iPhone|iPod/i.test(
                    userAgent
                ) ||
                (
                    /Macintosh/i.test(
                        userAgent
                    ) &&
                    maxTouchPoints > 1
                );


            PWAInstaller.ipad =
                /iPad/i.test(
                    userAgent
                ) ||
                (
                    /Macintosh/i.test(
                        userAgent
                    ) &&
                    maxTouchPoints > 1
                );


            PWAInstaller.android =
                /Android/i.test(
                    userAgent
                );


            PWAInstaller.mobile =
                /Android|iPhone|iPod|iPad/i.test(
                    userAgent
                ) ||
                maxTouchPoints > 1;


            PWAInstaller.desktop =
                !PWAInstaller.mobile;


            PWAInstaller.emit(
                "pwa:platform-detected",
                {
                    ios:
                        PWAInstaller.ios,

                    ipad:
                        PWAInstaller.ipad,

                    android:
                        PWAInstaller.android,

                    mobile:
                        PWAInstaller.mobile,

                    desktop:
                        PWAInstaller.desktop,

                    platform:
                        platform,

                    userAgent:
                        userAgent

                }
            );


            return {

                ios:
                    PWAInstaller.ios,

                ipad:
                    PWAInstaller.ipad,

                android:
                    PWAInstaller.android,

                mobile:
                    PWAInstaller.mobile,

                desktop:
                    PWAInstaller.desktop

            };

        };


    /* ========================================================
     * STANDALONE DETECTION
     * ======================================================== */

    PWAInstaller.isStandalone =
        function () {

            let standalone =
                false;


            try {

                standalone =
                    window.matchMedia &&
                    window.matchMedia(
                        "(display-mode: standalone)"
                    ).matches;

            } catch (error) {

                standalone =
                    false;

            }


            /*
             * iOS Safari verwendet zusätzlich
             * navigator.standalone.
             */

            if (
                navigator.standalone === true
            ) {

                standalone =
                    true;

            }


            PWAInstaller.standalone =
                standalone;


            PWAInstaller.installed =
                standalone;


            return standalone;

        };


    /* ========================================================
     * STATUS
     * ======================================================== */

    PWAInstaller.getStatus =
        function () {

            return {

                state:
                    PWAInstaller.state,

                initialized:
                    PWAInstaller.initialized,

                installAvailable:
                    PWAInstaller
                        .installAvailable,

                installed:
                    PWAInstaller
                        .installed,

                standalone:
                    PWAInstaller
                        .standalone,

                ios:
                    PWAInstaller.ios,

                ipad:
                    PWAInstaller.ipad,

                android:
                    PWAInstaller.android,

                mobile:
                    PWAInstaller.mobile,

                desktop:
                    PWAInstaller.desktop

            };

        };


    /* ========================================================
     * BEFORE INSTALL PROMPT
     * ======================================================== */

    PWAInstaller.handleBeforeInstallPrompt =
        function (
            event
        ) {

            /*
             * Browser soll den nativen Dialog
             * nicht sofort selbst anzeigen.
             */

            event.preventDefault();


            PWAInstaller.installPrompt =
                event;


            PWAInstaller
                .installAvailable =
                true;


            PWAInstaller.setState(
                "install-available"
            );


            PWAInstaller.emit(
                "pwa:install-available",
                PWAInstaller
                    .getStatus()
            );

        };


    /* ========================================================
     * APP INSTALLED
     * ======================================================== */

    PWAInstaller.handleAppInstalled =
        function () {

            PWAInstaller.installPrompt =
                null;


            PWAInstaller
                .installAvailable =
                false;


            PWAInstaller
                .installed =
                true;


            PWAInstaller
                .standalone =
                true;


            PWAInstaller.setState(
                "installed"
            );


            PWAInstaller.emit(
                "pwa:installed",
                PWAInstaller
                    .getStatus()
            );

        };


    /* ========================================================
     * INSTALL
     * ======================================================== */

    PWAInstaller.install =
        async function () {

            /*
             * Bereits installiert?
             */

            if (
                PWAInstaller.isStandalone()
            ) {

                PWAInstaller.setState(
                    "already-installed"
                );


                return {

                    success:
                        true,

                    installed:
                        true,

                    reason:
                        "already-installed"

                };

            }


            /*
             * Browser besitzt keinen
             * Installations-Prompt.
             */

            if (
                !PWAInstaller.installPrompt
            ) {

                PWAInstaller.setState(
                    "manual-install-required"
                );


                const instructions =
                    PWAInstaller
                        .getInstallInstructions();


                PWAInstaller.emit(
                    "pwa:manual-install-required",
                    instructions
                );


                return {

                    success:
                        false,

                    installed:
                        false,

                    manual:
                        true,

                    instructions:
                        instructions

                };

            }


            try {

                PWAInstaller.setState(
                    "installing"
                );


                const prompt =
                    PWAInstaller
                        .installPrompt;


                /*
                 * Browser zeigt jetzt seinen
                 * offiziellen PWA-Installationsdialog.
                 */

                await prompt.prompt();


                const choice =
                    await prompt.userChoice;


                PWAInstaller
                    .installPrompt =
                    null;


                PWAInstaller
                    .installAvailable =
                    false;


                if (
                    choice &&
                    choice.outcome ===
                    "accepted"
                ) {

                    PWAInstaller.setState(
                        "install-accepted"
                    );


                    PWAInstaller.emit(
                        "pwa:install-accepted",
                        choice
                    );


                    return {

                        success:
                            true,

                        accepted:
                            true,

                        outcome:
                            choice.outcome

                    };

                }


                PWAInstaller.setState(
                    "install-dismissed"
                );


                PWAInstaller.emit(
                    "pwa:install-dismissed",
                    choice
                );


                return {

                    success:
                        false,

                    accepted:
                        false,

                    outcome:
                        choice &&
                        choice.outcome

                };

            } catch (error) {

                PWAInstaller.setState(
                    "install-error"
                );


                PWAInstaller.emit(
                    "pwa:install-error",
                    {
                        error:
                            error.message
                    }
                );


                return {

                    success:
                        false,

                    error:
                        error.message

                };

            }

        };


    /* ========================================================
     * IOS INSTALL INSTRUCTIONS
     * ======================================================== */

    PWAInstaller.getInstallInstructions =
        function () {

            if (
                PWAInstaller.ios ||
                PWAInstaller.ipad
            ) {

                return {

                    platform:
                        "ios",

                    steps: [

                        "HalDo AI OS in Safari öffnen.",

                        "Teilen/Senden-Menü öffnen.",

                        "„Zum Home-Bildschirm“ auswählen.",

                        "HalDo AI OS hinzufügen.",

                        "HalDo AI OS über das neue Symbol starten."

                    ]

                };

            }


            if (
                PWAInstaller.android
            ) {

                return {

                    platform:
                        "android",

                    steps: [

                        "HalDo AI OS im unterstützten Browser öffnen.",

                        "Browser-Menü öffnen.",

                        "„App installieren“ oder „Zum Startbildschirm hinzufügen“ auswählen.",

                        "Installation bestätigen."

                    ]

                };

            }


            return {

                platform:
                    "desktop",

                steps: [

                    "HalDo AI OS im unterstützten Browser öffnen.",

                    "Installationssymbol in der Browserleiste auswählen.",

                    "Installation bestätigen."

                ]

            };

        };


    /* ========================================================
     * CHECK INSTALLABILITY
     * ======================================================== */

    PWAInstaller.canInstall =
        function () {

            return (
                PWAInstaller
                    .installAvailable ===
                true
            );

        };


    /* ========================================================
     * GET INSTALLATION MODE
     * ======================================================== */

    PWAInstaller.getDisplayMode =
        function () {

            try {

                if (
                    window.matchMedia(
                        "(display-mode: standalone)"
                    ).matches
                ) {

                    return "standalone";

                }


                if (
                    window.matchMedia(
                        "(display-mode: fullscreen)"
                    ).matches
                ) {

                    return "fullscreen";

                }


                if (
                    window.matchMedia(
                        "(display-mode: minimal-ui)"
                    ).matches
                ) {

                    return "minimal-ui";

                }


                return "browser";

            } catch (error) {

                return "unknown";

            }

        };


    /* ========================================================
     * WAIT FOR SERVICE WORKER
     * ======================================================== */

    PWAInstaller.isServiceWorkerReady =
        async function () {

            if (
                !("serviceWorker" in navigator)
            ) {

                return false;

            }


            try {

                const registration =
                    await navigator
                        .serviceWorker
                        .ready;


                return Boolean(
                    registration
                );

            } catch (error) {

                return false;

            }

        };


    /* ========================================================
     * SERVICE WORKER REGISTRATION
     * ======================================================== */

    PWAInstaller.registerServiceWorker =
        async function (
            path
        ) {

            if (
                !("serviceWorker" in navigator)
            ) {

                return {

                    success:
                        false,

                    reason:
                        "service-worker-unsupported"

                };

            }


            const serviceWorkerPath =
                path ||
                "./service-worker.js";


            try {

                const registration =
                    await navigator
                        .serviceWorker
                        .register(
                            serviceWorkerPath
                        );


                PWAInstaller.emit(
                    "pwa:service-worker-registered",
                    {
                        registration:
                            registration
                    }
                );


                return {

                    success:
                        true,

                    registration:
                        registration

                };

            } catch (error) {

                PWAInstaller.emit(
                    "pwa:service-worker-error",
                    {
                        error:
                            error.message
                    }
                );


                return {

                    success:
                        false,

                    error:
                        error.message

                };

            }

        };


    /* ========================================================
     * UPDATE SERVICE WORKER
     * ======================================================== */

    PWAInstaller.updateServiceWorker =
        async function () {

            if (
                !("serviceWorker" in navigator)
            ) {

                return {

                    success:
                        false,

                    reason:
                        "service-worker-unsupported"

                };

            }


            try {

                const registration =
                    await navigator
                        .serviceWorker
                        .getRegistration();


                if (!registration) {

                    return {

                        success:
                            false,

                        reason:
                            "no-registration"

                    };

                }


                await registration.update();


                PWAInstaller.emit(
                    "pwa:service-worker-updated",
                    {
                        registration:
                            registration
                    }
                );


                return {

                    success:
                        true

                };

            } catch (error) {

                return {

                    success:
                        false,

                    error:
                        error.message

                };

            }

        };


    /* ========================================================
     * REQUEST SYSTEM INSTALL
     * ======================================================== */

    PWAInstaller.requestInstall =
        async function () {

            return PWAInstaller.install();

        };


    /* ========================================================
     * INIT
     * ======================================================== */

    PWAInstaller.init =
        function () {

            if (
                PWAInstaller.initialized
            ) {

                return PWAInstaller;

            }


            PWAInstaller
                .detectPlatform();


            PWAInstaller
                .isStandalone();


            window.addEventListener(
                "beforeinstallprompt",
                function (
                    event
                ) {

                    PWAInstaller
                        .handleBeforeInstallPrompt(
                            event
                        );

                }
            );


            window.addEventListener(
                "appinstalled",
                function () {

                    PWAInstaller
                        .handleAppInstalled();

                }
            );


            /*
             * Falls die App bereits im
             * Standalone-Modus läuft.
             */

            if (
                PWAInstaller.standalone
            ) {

                PWAInstaller.setState(
                    "installed"
                );

            } else {

                PWAInstaller.setState(
                    "ready"
                );

            }


            PWAInstaller.initialized =
                true;


            PWAInstaller.emit(
                "pwa:manager-ready",
                PWAInstaller
                    .getStatus()
            );


            return PWAInstaller;

        };


    /* ========================================================
     * GLOBAL REGISTRATION
     * ======================================================== */

    window.HalDoPWAInstaller =
        PWAInstaller;

    window.HalDoV20PWAInstaller =
        PWAInstaller;

    HalDoOS.pwaInstaller =
        PWAInstaller;


    /* ========================================================
     * BOOT
     * ======================================================== */

    function boot() {

        PWAInstaller.init();

    }


    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            boot,
            {
                once:
                    true
            }
        );

    } else {

        boot();

    }


})(window);