/*
 * ============================================================
 * HALDO AI OS 20
 * DISPLAY LOADER
 * ============================================================
 *
 * Datei:
 * js/haldo-display-loader.js
 *
 * Aufgabe:
 * Lädt und überwacht die zentrale Display-Schicht.
 *
 * ============================================================
 */

(function (window, document) {

    "use strict";


    const HalDoOS =
        window.HalDoOS =
        window.HalDoOS || {};

    const V20 =
        window.HalDoV20 =
        window.HalDoV20 || {};


    const Loader = {

        name:
            "HalDo V20 Display Loader",

        version:
            "20.0.0",

        initialized:
            false,

        loading:
            false,

        ready:
            false,

        scripts: [

            "js/haldo-display-system.js",

            "js/haldo-display-boot-bridge.js"

        ],

        loaded:
            [],

        failed:
            []

    };


    /* ========================================================
       BASE PATH
    ======================================================== */

    Loader.getBasePath =
        function () {

            const current =
                document.currentScript;

            if (
                current &&
                current.src
            ) {

                const url =
                    new URL(
                        current.src,
                        window.location.href
                    );

                return (
                    url.pathname
                        .replace(
                            /\/js\/[^/]*$/,
                            "/"
                        )
                );

            }

            return "./";

        };


    /* ========================================================
       NORMALIZE PATH
    ======================================================== */

    Loader.normalize =
        function (path) {

            if (
                !path
            ) {
                return "";
            }

            if (
                /^(https?:)?\/\//i.test(path)
            ) {

                return path;

            }

            if (
                path.charAt(0) === "/"
            ) {

                return path;

            }

            return (
                Loader.getBasePath()
                +
                path.replace(
                    /^\.?\//,
                    ""
                )
            );

        };


    /* ========================================================
       CHECK EXISTING SCRIPT
    ======================================================== */

    Loader.isLoaded =
        function (path) {

            const normalized =
                Loader.normalize(path);


            const scripts =
                document.querySelectorAll(
                    "script[src]"
                );


            for (
                let i = 0;
                i < scripts.length;
                i++
            ) {

                try {

                    const src =
                        new URL(
                            scripts[i].src,
                            window.location.href
                        ).href;

                    const target =
                        new URL(
                            normalized,
                            window.location.href
                        ).href;

                    if (
                        src === target
                    ) {

                        return true;

                    }

                } catch (error) {}

            }


            return false;

        };


    /* ========================================================
       LOAD SCRIPT
    ======================================================== */

    Loader.load =
        function (path) {

            return new Promise(
                function (resolve, reject) {

                    if (
                        Loader.isLoaded(path)
                    ) {

                        Loader.loaded.push(path);

                        resolve(true);

                        return;

                    }


                    const script =
                        document.createElement(
                            "script"
                        );


                    script.src =
                        Loader.normalize(path);

                    script.async =
                        false;

                    script.defer =
                        false;


                    script.onload =
                        function () {

                            Loader.loaded.push(
                                path
                            );

                            resolve(true);

                        };


                    script.onerror =
                        function () {

                            Loader.failed.push(
                                path
                            );

                            reject(
                                new Error(
                                    "Display-Datei konnte nicht geladen werden: " +
                                    path
                                )
                            );

                        };


                    (
                        document.head ||
                        document.documentElement
                    ).appendChild(
                        script
                    );

                }
            );

        };


    /* ========================================================
       WAIT FOR DISPLAY
    ======================================================== */

    Loader.waitForDisplay =
        function (
            timeout
        ) {

            timeout =
                Number(timeout) ||
                5000;


            return new Promise(
                function (resolve) {

                    const started =
                        Date.now();


                    function check() {

                        if (
                            window.HalDoDisplay
                        ) {

                            resolve(
                                window.HalDoDisplay
                            );

                            return;

                        }


                        if (
                            Date.now() - started
                            >= timeout
                        ) {

                            resolve(null);

                            return;

                        }


                        window.setTimeout(
                            check,
                            50
                        );

                    }


                    check();

                }
            );

        };


    /* ========================================================
       WAIT FOR BRIDGE
    ======================================================== */

    Loader.waitForBridge =
        function (
            timeout
        ) {

            timeout =
                Number(timeout) ||
                5000;


            return new Promise(
                function (resolve) {

                    const started =
                        Date.now();


                    function check() {

                        if (
                            window.HalDoDisplayBootBridge
                        ) {

                            resolve(
                                window.HalDoDisplayBootBridge
                            );

                            return;

                        }


                        if (
                            Date.now() - started
                            >= timeout
                        ) {

                            resolve(null);

                            return;

                        }


                        window.setTimeout(
                            check,
                            50
                        );

                    }


                    check();

                }
            );

        };


    /* ========================================================
       START
    ======================================================== */

    Loader.start =
        async function () {

            if (
                Loader.loading
            ) {

                return Loader;

            }


            if (
                Loader.ready
            ) {

                return Loader;

            }


            Loader.loading =
                true;


            try {

                for (
                    let i = 0;
                    i < Loader.scripts.length;
                    i++
                ) {

                    const path =
                        Loader.scripts[i];


                    try {

                        await Loader.load(
                            path
                        );

                    } catch (error) {

                        console.warn(
                            "[HalDo Display Loader]",
                            error
                        );

                    }

                }


                const display =
                    await Loader.waitForDisplay();


                if (display) {

                    try {

                        if (
                            typeof display.init ===
                            "function"
                        ) {

                            display.init();

                        }

                        if (
                            typeof display.show ===
                            "function"
                        ) {

                            display.show();

                        }

                    } catch (error) {

                        console.warn(
                            "[HalDo Display Loader] Display start warning:",
                            error
                        );

                    }

                }


                const bridge =
                    await Loader.waitForBridge();


                if (bridge) {

                    try {

                        if (
                            typeof bridge.init ===
                            "function"
                        ) {

                            bridge.init();

                        }

                    } catch (error) {

                        console.warn(
                            "[HalDo Display Loader] Bridge start warning:",
                            error
                        );

                    }

                }


                Loader.ready =
                    true;

                Loader.initialized =
                    true;


                Loader.loading =
                    false;


                HalDoOS.displayLoader =
                    Loader;

                V20.displayLoader =
                    Loader;


                try {

                    window.dispatchEvent(
                        new CustomEvent(
                            "haldo:v20:display-loader-ready",
                            {
                                detail:
                                    Loader.getStatus()
                            }
                        )
                    );

                } catch (error) {}


                console.info(
                    "[HalDo Display Loader] READY"
                );


                return Loader;

            } catch (error) {

                Loader.loading =
                    false;


                console.error(
                    "[HalDo Display Loader] Fatal error:",
                    error
                );


                return Loader;

            }

        };


    /* ========================================================
       STATUS
    ======================================================== */

    Loader.getStatus =
        function () {

            return {

                name:
                    Loader.name,

                version:
                    Loader.version,

                initialized:
                    Loader.initialized,

                loading:
                    Loader.loading,

                ready:
                    Loader.ready,

                loaded:
                    Loader.loaded.slice(),

                failed:
                    Loader.failed.slice(),

                timestamp:
                    Date.now()

            };

        };


    /* ========================================================
       GLOBAL API
    ======================================================== */

    window.HalDoDisplayLoader =
        Loader;


    HalDoOS.displayLoader =
        Loader;


    V20.displayLoader =
        Loader;


    /* ========================================================
       START AFTER DOM
    ======================================================== */

    function start() {

        Loader.start();

    }


    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            start,
            {
                once: true
            }
        );

    } else {

        start();

    }


})(window, document);
