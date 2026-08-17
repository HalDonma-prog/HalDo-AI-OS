/*
 * ============================================================
 * HalDo AI OS 20
 * Version Manager
 * ============================================================
 */

(function (window) {

    "use strict";

    const HalDoOS =
        window.HalDoOS =
        window.HalDoOS || {};

    const VersionManager = {

        name:
            "HalDo Version Manager",

        version:
            "20.0.0",

        product:
            "HalDo AI OS",

        initialized:
            false,

        current:
            "20.0.0",

        latest:
            "20.0.0",

        channel:
            "stable",

        status:
            "unknown"

    };


    function normalizeVersion(
        value
    ) {

        const parts =
            String(
                value || "0.0.0"
            )
            .replace(
                /^v/i,
                ""
            )
            .split(".")
            .map(
                function (
                    part
                ) {

                    const number =
                        parseInt(
                            part,
                            10
                        );

                    return Number.isFinite(
                        number
                    )
                        ? number
                        : 0;

                }
            );

        while (
            parts.length < 3
        ) {

            parts.push(
                0
            );

        }

        return parts
            .slice(0, 3);

    }


    function compare(
        a,
        b
    ) {

        const av =
            normalizeVersion(a);

        const bv =
            normalizeVersion(b);


        for (
            let i = 0;
            i < 3;
            i++
        ) {

            if (
                av[i] > bv[i]
            ) {

                return 1;

            }

            if (
                av[i] < bv[i]
            ) {

                return -1;

            }

        }


        return 0;

    }


    VersionManager.compare =
        compare;


    VersionManager.isNewer =
        function (
            candidate,
            current
        ) {

            return compare(
                candidate,
                current ||
                VersionManager.current
            ) > 0;

        };


    VersionManager.isOlder =
        function (
            candidate,
            current
        ) {

            return compare(
                candidate,
                current ||
                VersionManager.current
            ) < 0;

        };


    VersionManager.isEqual =
        function (
            candidate,
            current
        ) {

            return compare(
                candidate,
                current ||
                VersionManager.current
            ) === 0;

        };


    VersionManager.setCurrent =
        function (
            version
        ) {

            VersionManager.current =
                String(
                    version ||
                    VersionManager.current
                );

            return VersionManager.current;

        };


    VersionManager.setLatest =
        function (
            version
        ) {

            VersionManager.latest =
                String(
                    version ||
                    VersionManager.latest
                );

            return VersionManager.latest;

        };


    VersionManager.hasUpdate =
        function () {

            return VersionManager.isNewer(
                VersionManager.latest,
                VersionManager.current
            );

        };


    VersionManager.getStatus =
        function () {

            return {

                product:
                    VersionManager.product,

                current:
                    VersionManager.current,

                latest:
                    VersionManager.latest,

                channel:
                    VersionManager.channel,

                updateAvailable:
                    VersionManager.hasUpdate(),

                status:
                    VersionManager.status

            };

        };


    VersionManager.loadManifest =
        async function (
            url
        ) {

            const manifestUrl =
                url ||
                "./data/haldo-update-manifest.json";


            const response =
                await fetch(
                    manifestUrl,
                    {
                        cache:
                            "no-store"
                    }
                );


            if (
                !response.ok
            ) {

                throw new Error(
                    "Update-Manifest konnte nicht geladen werden."
                );

            }


            const manifest =
                await response.json();


            if (
                manifest.versions
            ) {

                if (
                    manifest.versions.currentVersion
                ) {

                    VersionManager.setCurrent(
                        manifest
                            .versions
                            .currentVersion
                    );

                }


                if (
                    manifest.versions.latestVersion
                ) {

                    VersionManager.setLatest(
                        manifest
                            .versions
                            .latestVersion
                    );

                }

            }


            if (
                manifest.product &&
                manifest.product.channel
            ) {

                VersionManager.channel =
                    manifest.product.channel;

            }


            VersionManager.status =
                "ready";


            return manifest;

        };


    VersionManager.check =
        async function () {

            try {

                const manifest =
                    await VersionManager.loadManifest();


                return {

                    success:
                        true,

                    updateAvailable:
                        VersionManager.hasUpdate(),

                    current:
                        VersionManager.current,

                    latest:
                        VersionManager.latest,

                    manifest:
                        manifest

                };

            } catch (error) {

                VersionManager.status =
                    "error";


                return {

                    success:
                        false,

                    updateAvailable:
                        false,

                    current:
                        VersionManager.current,

                    latest:
                        VersionManager.latest,

                    error:
                        error.message

                };

            }

        };


    VersionManager.init =
        async function () {

            if (
                VersionManager.initialized
            ) {

                return VersionManager;

            }


            VersionManager.initialized =
                true;


            /*
             * Die lokale Version wird
             * aus der HTML-Konfiguration
             * übernommen, falls vorhanden.
             */

            const meta =
                document.querySelector(
                    'meta[name="haldo-version"]'
                );


            if (
                meta &&
                meta.content
            ) {

                VersionManager.setCurrent(
                    meta.content
                );

            }


            await VersionManager.check();


            if (
                HalDoOS.events &&
                typeof HalDoOS.events.emit ===
                "function"
            ) {

                HalDoOS.events.emit(
                    "system:version-ready",
                    VersionManager.getStatus()
                );

            }


            return VersionManager;

        };


    /*
     * Globale APIs
     */

    window.HalDoVersionManager =
        VersionManager;

    window.HalDoV20VersionManager =
        VersionManager;

    HalDoOS.versionManager =
        VersionManager;


    /*
     * Start
     */

    function boot() {

        VersionManager.init()
            .catch(
                function (
                    error
                ) {

                    console.warn(
                        "[HalDo Version Manager]",
                        error
                    );

                }
            );

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