/*
 * ============================================================
 * HALDO AI OS 20
 * DISPLAY SYSTEM
 * ============================================================
 *
 * Datei:
 * js/haldo-display-system.js
 *
 * Aufgabe:
 * Zentrale sichtbare Display-/Workspace-Schicht.
 *
 * Architektur:
 *
 * Boot
 *   ↓
 * Kernel
 *   ↓
 * System
 *   ↓
 * Display System
 *   ↓
 * Workspace
 *   ↓
 * Apps / Windows
 *
 * ============================================================
 */

(function (window, document) {

    "use strict";

    const HalDoOS =
        window.HalDoOS =
        window.HalDoOS || {};

    const Display = {

        name: "HalDo V20 Display System",

        version: "20.0.0",

        initialized: false,

        visible: false,

        workspace: null,

        events: {},

        config: {

            workspaceId:
                "haldo-v20-workspace",

            displayId:
                "haldo-v20-display",

            minimumHeight:
                400,

            minimumWidth:
                320

        }

    };


    /* ========================================================
       EVENT SYSTEM
    ======================================================== */

    Display.on = function (event, callback) {

        if (
            typeof callback !== "function"
        ) {
            return false;
        }

        if (
            !Array.isArray(
                Display.events[event]
            )
        ) {
            Display.events[event] = [];
        }

        Display.events[event].push(
            callback
        );

        return true;
    };


    Display.emit = function (
        event,
        detail
    ) {

        const listeners =
            Display.events[event];

        if (
            Array.isArray(listeners)
        ) {

            listeners.slice()
                .forEach(function (callback) {

                    try {

                        callback(detail);

                    } catch (error) {

                        console.warn(
                            "[HalDo Display] Event error:",
                            error
                        );

                    }

                });

        }

        try {

            window.dispatchEvent(
                new CustomEvent(
                    "haldo:display:" + event,
                    {
                        detail: detail
                    }
                )
            );

        } catch (error) {

            console.warn(
                "[HalDo Display] DOM event warning:",
                error
            );

        }

    };


    /* ========================================================
       FIND / CREATE ROOT
    ======================================================== */

    Display.findRoot = function () {

        return (
            document.getElementById(
                Display.config.displayId
            )
            ||
            document.getElementById(
                Display.config.workspaceId
            )
            ||
            document.querySelector(
                "[data-haldo-display]"
            )
            ||
            document.querySelector(
                "[data-haldo-workspace]"
            )
            ||
            document.body
        );

    };


    /* ========================================================
       CREATE WORKSPACE
    ======================================================== */

    Display.createWorkspace = function () {

        let root =
            document.getElementById(
                Display.config.workspaceId
            );

        if (root) {

            Display.workspace = root;

            return root;

        }


        root =
            document.createElement(
                "main"
            );

        root.id =
            Display.config.workspaceId;

        root.setAttribute(
            "data-haldo-workspace",
            "true"
        );

        root.setAttribute(
            "role",
            "main"
        );

        root.setAttribute(
            "aria-label",
            "HalDo AI OS Workspace"
        );


        root.style.position =
            "relative";

        root.style.width =
            "100%";

        root.style.height =
            "100%";

        root.style.minHeight =
            Display.config.minimumHeight +
            "px";

        root.style.minWidth =
            Display.config.minimumWidth +
            "px";

        root.style.overflow =
            "hidden";

        root.style.boxSizing =
            "border-box";


        const rootContainer =
            Display.findRoot();

        if (
            rootContainer &&
            rootContainer !== root
        ) {

            rootContainer.appendChild(
                root
            );

        }


        Display.workspace = root;

        return root;

    };


    /* ========================================================
       DISPLAY LAYER
    ======================================================== */

    Display.createDisplayLayer =
        function () {

            let display =
                document.getElementById(
                    Display.config.displayId
                );

            if (display) {

                return display;

            }


            display =
                document.createElement(
                    "div"
                );

            display.id =
                Display.config.displayId;

            display.setAttribute(
                "data-haldo-display",
                "true"
            );


            display.style.position =
                "absolute";

            display.style.inset =
                "0";

            display.style.width =
                "100%";

            display.style.height =
                "100%";

            display.style.overflow =
                "hidden";

            display.style.boxSizing =
                "border-box";


            const workspace =
                Display.workspace ||
                Display.createWorkspace();


            workspace.appendChild(
                display
            );


            return display;

        };


    /* ========================================================
       VISUAL FALLBACK
    ======================================================== */

    Display.createFallback =
        function () {

            const display =
                Display.createDisplayLayer();


            if (
                document.getElementById(
                    "haldo-display-fallback"
                )
            ) {
                return;
            }


            const fallback =
                document.createElement(
                    "section"
                );

            fallback.id =
                "haldo-display-fallback";

            fallback.setAttribute(
                "data-haldo-display-fallback",
                "true"
            );


            fallback.style.position =
                "absolute";

            fallback.style.inset =
                "0";

            fallback.style.display =
                "flex";

            fallback.style.alignItems =
                "center";

            fallback.style.justifyContent =
                "center";

            fallback.style.flexDirection =
                "column";

            fallback.style.boxSizing =
                "border-box";

            fallback.style.padding =
                "32px";

            fallback.style.textAlign =
                "center";

            fallback.style.fontFamily =
                "system-ui, -apple-system, BlinkMacSystemFont, sans-serif";


            const title =
                document.createElement(
                    "div"
                );

            title.textContent =
                "HalDo AI OS 20";

            title.style.fontSize =
                "clamp(28px, 5vw, 54px)";

            title.style.fontWeight =
                "700";

            title.style.letterSpacing =
                "0.04em";


            const status =
                document.createElement(
                    "div"
                );

            status.textContent =
                "Workspace wird vorbereitet …";

            status.style.marginTop =
                "12px";

            status.style.fontSize =
                "15px";

            status.style.opacity =
                "0.72";


            fallback.appendChild(
                title
            );

            fallback.appendChild(
                status
            );

            display.appendChild(
                fallback
            );

        };


    /* ========================================================
       REMOVE FALLBACK
    ======================================================== */

    Display.removeFallback =
        function () {

            const fallback =
                document.getElementById(
                    "haldo-display-fallback"
                );

            if (fallback) {

                fallback.remove();

            }

        };


    /* ========================================================
       SHOW
    ======================================================== */

    Display.show = function () {

        const workspace =
            Display.workspace ||
            Display.createWorkspace();


        workspace.style.display =
            "block";

        workspace.style.visibility =
            "visible";

        workspace.style.opacity =
            "1";


        Display.visible =
            true;


        Display.emit(
            "visible",
            {
                workspace:
                    workspace
            }
        );

    };


    /* ========================================================
       HIDE
    ======================================================== */

    Display.hide = function () {

        if (
            !Display.workspace
        ) {
            return;
        }


        Display.workspace.style.visibility =
            "hidden";

        Display.visible =
            false;


        Display.emit(
            "hidden"
        );

    };


    /* ========================================================
       READY STATE
    ======================================================== */

    Display.markReady =
        function () {

            Display.initialized =
                true;

            Display.visible =
                true;


            Display.removeFallback();


            Display.emit(
                "ready",
                Display.getStatus()
            );

        };


    /* ========================================================
       SYSTEM CONNECTION
    ======================================================== */

    Display.connectSystem =
        function () {

            try {

                if (
                    HalDoOS.system
                ) {

                    Display.system =
                        HalDoOS.system;

                }

            } catch (error) {

                console.warn(
                    "[HalDo Display] System connection warning:",
                    error
                );

            }

        };


    /* ========================================================
       KERNEL CONNECTION
    ======================================================== */

    Display.connectKernel =
        function () {

            try {

                const kernel =
                    window.HalDoKernel ||
                    (
                        HalDoOS &&
                        HalDoOS.kernel
                    );


                if (!kernel) {
                    return;
                }


                Display.kernel =
                    kernel;


                if (
                    typeof kernel.on ===
                    "function"
                ) {

                    kernel.on(
                        "kernel:ready",
                        function () {

                            Display.emit(
                                "kernel-ready"
                            );

                        }
                    );


                    kernel.on(
                        "system:ready",
                        function () {

                            Display.show();

                        }
                    );

                }


            } catch (error) {

                console.warn(
                    "[HalDo Display] Kernel connection warning:",
                    error
                );

            }

        };


    /* ========================================================
       INITIALIZE
    ======================================================== */

    Display.init =
        function () {

            if (
                Display.initialized
            ) {
                return Display;
            }


            Display.createWorkspace();

            Display.createDisplayLayer();

            Display.createFallback();

            Display.connectSystem();

            Display.connectKernel();

            Display.show();


            Display.markReady();


            return Display;

        };


    /* ========================================================
       STATUS
    ======================================================== */

    Display.getStatus =
        function () {

            return {

                name:
                    Display.name,

                version:
                    Display.version,

                initialized:
                    Display.initialized,

                visible:
                    Display.visible,

                workspace:
                    !!Display.workspace,

                timestamp:
                    Date.now()

            };

        };


    /* ========================================================
       GLOBAL API
    ======================================================== */

    window.HalDoDisplay =
        Display;

    HalDoOS.display =
        Display;


    window.HalDoV20 =
        window.HalDoV20 ||
        {};

    window.HalDoV20.display =
        Display;


    /* ========================================================
       START
    ======================================================== */

    function startDisplay() {

        try {

            Display.init();

        } catch (error) {

            console.error(
                "[HalDo Display] Initialization failed:",
                error
            );

        }

    }


    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            startDisplay,
            {
                once: true
            }
        );

    } else {

        startDisplay();

    }


    /* ========================================================
       FINAL EVENT
    ======================================================== */

    try {

        window.dispatchEvent(
            new CustomEvent(
                "haldo:v20:display-ready",
                {
                    detail:
                        Display.getStatus()
                }
            )
        );

    } catch (error) {

        console.warn(
            "[HalDo Display] Final event warning:",
            error
        );

    }


    console.info(
        "[HalDo AI OS 20]",
        "Display System loaded."
    );


})(window, document);
