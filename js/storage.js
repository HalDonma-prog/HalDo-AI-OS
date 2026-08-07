/*
==========================================
HalDo AI OS 18
STORAGE MANAGER
Professional Ultimate Foundation
Version 18.0.0
==========================================
*/

(function () {

    "use strict";

    const HalDoStorage = {

        name: "HalDo Storage",
        version: "18.0.0",

        prefix: "haldo_ai_os_18_",

        status: "ready",


        key(name) {

            return (
                this.prefix +
                name
            );

        },


        set(
            name,
            value
        ) {

            try {

                localStorage.setItem(
                    this.key(name),
                    JSON.stringify(value)
                );

                return true;

            } catch (error) {

                console.error(
                    "HalDo Storage SET Error:",
                    error
                );

                return false;

            }

        },


        get(
            name,
            fallback = null
        ) {

            try {

                const value =
                    localStorage.getItem(
                        this.key(name)
                    );

                if (value === null) {
                    return fallback;
                }

                return JSON.parse(value);

            } catch (error) {

                console.error(
                    "HalDo Storage GET Error:",
                    error
                );

                return fallback;

            }

        },


        remove(name) {

            try {

                localStorage.removeItem(
                    this.key(name)
                );

                return true;

            } catch (error) {

                console.error(
                    "HalDo Storage REMOVE Error:",
                    error
                );

                return false;

            }

        },


        clear() {

            try {

                const keys = [];

                for (
                    let i = 0;
                    i < localStorage.length;
                    i++
                ) {

                    const key =
                        localStorage.key(i);

                    if (
                        key &&
                        key.startsWith(
                            this.prefix
                        )
                    ) {

                        keys.push(key);

                    }

                }

                keys.forEach(
                    key =>
                        localStorage.removeItem(
                            key
                        )
                );

                return true;

            } catch (error) {

                console.error(
                    "HalDo Storage CLEAR Error:",
                    error
                );

                return false;

            }

        },


        has(name) {

            return (
                localStorage.getItem(
                    this.key(name)
                ) !== null
            );

        },


        keys() {

            const result = [];

            for (
                let i = 0;
                i < localStorage.length;
                i++
            ) {

                const key =
                    localStorage.key(i);

                if (
                    key &&
                    key.startsWith(
                        this.prefix
                    )
                ) {

                    result.push(
                        key.substring(
                            this.prefix.length
                        )
                    );

                }

            }

            return result;

        },


        getStatus() {

            return {

                status:
                    this.status,

                storage:
                    "localStorage",

                keys:
                    this.keys()

            };

        }

    };


    window.HalDoStorage =
        HalDoStorage;


    window.addEventListener(
        "DOMContentLoaded",
        function () {

            if (
                window.HalDoKernel
            ) {

                HalDoKernel.registerModule(
                    "storage",
                    HalDoStorage
                );

            }

        }
    );

})();