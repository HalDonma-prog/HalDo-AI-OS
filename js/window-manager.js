/*

============================================================

 HALDO AI OS 18

 WINDOW MANAGER

 Professional Ultimate Foundation

============================================================

 Datei:

 js/window-manager.js

 Aufgabe:

 - Verwaltung geöffneter App-Fenster

 - App-Fenster erstellen

 - App-Fenster öffnen

 - App-Fenster schließen

 - Minimieren

 - Maximieren

 - Wiederherstellen

 - Fokusverwaltung

 - Z-Index-Verwaltung

 - Fensterpositionen

 - Fenstergrößen

 - Mobile Unterstützung

 - Vorbereitung für Desktop / Tablet / iPhone

============================================================

*/

"use strict";

(function (window) {

    /* ========================================================

       WINDOW MANAGER

       ======================================================== */

    const HalDoWindowManager = {

        name:

            "HalDo Window Manager",

        version:

            "18.0.0",

        status:

            "CREATED",

        initialized:

            false,

        /* ====================================================

           CORE

           ==================================================== */

        appManager:

            null,

        launcher:

            null,

        /* ====================================================

           WINDOWS

           ==================================================== */

        windows:

            new Map(),

        activeWindow:

            null,

        zIndex:

            1000,

        /* ====================================================

           CONTAINER

           ==================================================== */

        desktop:

            null,

        /* ====================================================

           EVENTS

           ==================================================== */

        listeners:

            new Map(),

        /* ====================================================

           INITIALIZE

           ==================================================== */

        initialize() {

            if (

                this.initialized

            ) {

                return true;

            }

            this.status =

                "INITIALIZING";

            this.connect();

            this.createDesktop();

            this.initialized =

                true;

            this.status =

                "READY";

            this.emit(

                "ready",

                this.getStatus()

            );

            this.log(

                "Window Manager ist bereit."

            );

            return true;

        },

        /* ====================================================

           VERBINDEN

           ==================================================== */

        connect() {

            this.appManager =

                window.HalDoAppManager ||

                null;

            this.launcher =

                window.HalDoAppLauncher ||

                null;

            return true;

        },

        /* ====================================================

           DESKTOP ERSTELLEN

           ==================================================== */

        createDesktop() {

            let desktop =

                document.querySelector(

                    "[data-haldo-desktop]"

                );

            if (

                !desktop

            ) {

                desktop =

                    document.createElement(

                        "main"

                    );

                desktop.id =

                    "haldo-desktop";

                desktop.className =

                    "haldo-desktop";

                desktop.setAttribute(

                    "data-haldo-desktop",

                    "true"

                );

                document.body.appendChild(

                    desktop

                );

            }

            this.desktop =

                desktop;

            return desktop;

        },

        /* ====================================================

           APP-FENSTER ÖFFNEN

           ==================================================== */

        open(

            appId,

            options = {}

        ) {

            this.connect();

            if (

                !this.desktop

            ) {

                this.createDesktop();

            }

            /*

            ----------------------------------------------------

            Bereits geöffnet?

            ----------------------------------------------------

            */

            if (

                this.windows.has(

                    appId

                )

            ) {

                const existing =

                    this.windows.get(

                        appId

                    );

                this.focus(

                    appId

                );

                return existing;

            }

            /*

            ----------------------------------------------------

            APP ERMITTELN

            ----------------------------------------------------

            */

            let app =

                null;

            if (

                this.appManager

            ) {

                app =

                    this.appManager.get(

                        appId

                    );

            }

            if (

                !app

            ) {

                this.log(

                    `App nicht gefunden: ${appId}`

                );

                return null;

            }

            /*

            ----------------------------------------------------

            WINDOW

            ----------------------------------------------------

            */

            const windowData = {

                id:

                    `window-${appId}`,

                appId:

                    app.id,

                title:

                    app.name,

                minimized:

                    false,

                maximized:

                    false,

                focused:

                    false,

                createdAt:

                    Date.now(),

                element:

                    null

            };

            /*

            ----------------------------------------------------

            ELEMENT

            ----------------------------------------------------

            */

            const element =

                document.createElement(

                    "section"

                );

            element.className =

                "haldo-window";

            element.id =

                windowData.id;

            element.dataset.appId =

                app.id;

            element.setAttribute(

                "role",

                "dialog"

            );

            element.setAttribute(

                "aria-label",

                app.name

            );

            /*

            ----------------------------------------------------

            POSITION

            ----------------------------------------------------

            */

            const offset =

                this.windows.size *

                24;

            element.style.left =

                `${40 + offset}px`;

            element.style.top =

                `${40 + offset}px`;

            element.style.width =

                options.width ||

                "min(92vw, 900px)";

            element.style.height =

                options.height ||

                "min(78vh, 650px)";

            /*

            ----------------------------------------------------

            HEADER

            ----------------------------------------------------

            */

            const header =

                document.createElement(

                    "header"

                );

            header.className =

                "haldo-window-header";

            /*

            ----------------------------------------------------

            TITLE

            ----------------------------------------------------

            */

            const title =

                document.createElement(

                    "div"

                );

            title.className =

                "haldo-window-title";

            title.textContent =

                app.name;

            /*

            ----------------------------------------------------

            CONTROLS

            ----------------------------------------------------

            */

            const controls =

                document.createElement(

                    "div"

                );

            controls.className =

                "haldo-window-controls";

            /*

            MINIMIZE

            */

            const minimize =

                document.createElement(

                    "button"

                );

            minimize.type =

                "button";

            minimize.className =

                "haldo-window-button minimize";

            minimize.textContent =

                "−";

            minimize.setAttribute(

                "aria-label",

                "Minimieren"

            );

            minimize.addEventListener(

                "click",

                event => {

                    event.stopPropagation();

                    this.minimize(

                        appId

                    );

                }

            );

            /*

            MAXIMIZE

            */

            const maximize =

                document.createElement(

                    "button"

                );

            maximize.type =

                "button";

            maximize.className =

                "haldo-window-button maximize";

            maximize.textContent =

                "□";

            maximize.setAttribute(

                "aria-label",

                "Maximieren"

            );

            maximize.addEventListener(

                "click",

                event => {

                    event.stopPropagation();

                    this.toggleMaximize(

                        appId

                    );

                }

            );

            /*

            CLOSE

            */

            const close =

                document.createElement(

                    "button"

                );

            close.type =

                "button";

            close.className =

                "haldo-window-button close";

            close.textContent =

                "×";

            close.setAttribute(

                "aria-label",

                "Schließen"

            );

            close.addEventListener(

                "click",

                event => {

                    event.stopPropagation();

                    this.close(

                        appId

                    );

                }

            );

            controls.appendChild(

                minimize

            );

            controls.appendChild(

                maximize

            );

            controls.appendChild(

                close

            );

            header.appendChild(

                title

            );

            header.appendChild(

                controls

            );

            /*

            ----------------------------------------------------

            CONTENT

            ----------------------------------------------------

            */

            const content =

                document.createElement(

                    "div"

                );

            content.className =

                "haldo-window-content";

            content.dataset.appContent =

                app.id;

            /*

            ----------------------------------------------------

            APP PLACEHOLDER

            ----------------------------------------------------

            */

            const placeholder =

                document.createElement(

                    "div"

                );

            placeholder.className =

                "haldo-app-placeholder";

            placeholder.innerHTML = `

                <div class="haldo-app-placeholder-icon">

                    ${this.getIcon(app)}

                </div>

                <h2></h2>

                <p></p>

            `;

            placeholder

                .querySelector("h2")

                .textContent =

                app.name;

            placeholder

                .querySelector("p")

                .textContent =

                app.description ||

                "HalDo App";

            content.appendChild(

                placeholder

            );

            /*

            ----------------------------------------------------

            ZUSAMMENSETZEN

            ----------------------------------------------------

            */

            element.appendChild(

                header

            );

            element.appendChild(

                content

            );

            /*

            ----------------------------------------------------

            CLICK / FOCUS

            ----------------------------------------------------

            */

            element.addEventListener(

                "pointerdown",

                () => {

                    this.focus(

                        appId

                    );

                }

            );

            /*

            ----------------------------------------------------

            DESKTOP

            ----------------------------------------------------

            */

            this.desktop.appendChild(

                element

            );

            windowData.element =

                element;

            this.windows.set(

                appId,

                windowData

            );

            /*

            ----------------------------------------------------

            FOCUS

            ----------------------------------------------------

            */

            this.focus(

                appId

            );

            /*

            ----------------------------------------------------

            APP MANAGER

            ----------------------------------------------------

            */

            if (

                this.appManager

            ) {

                this.appManager.open(

                    appId

                );

            }

            this.emit(

                "window-opened",

                windowData

            );

            return windowData;

        },

        /* ====================================================

           ICON

           ==================================================== */

        getIcon(

            app

        ) {

            if (

                app &&

                typeof app.icon ===

                "string"

            ) {

                if (

                    app.icon.includes(

                        ".png"

                    ) ||

                    app.icon.includes(

                        ".jpg"

                    ) ||

                    app.icon.includes(

                        ".jpeg"

                    ) ||

                    app.icon.includes(

                        ".webp"

                    ) ||

                    app.icon.includes(

                        ".svg"

                    )

                ) {

                    const image =

                        document.createElement(

                            "img"

                        );

                    image.src =

                        app.icon;

                    image.alt =

                        app.name;

                    return image.outerHTML;

                }

                return app.icon;

            }

            return "▦";

        },

        /* ====================================================

           FOCUS

           ==================================================== */

        focus(

            appId

        ) {

            const target =

                this.windows.get(

                    appId

                );

            if (

                !target

            ) {

                return false;

            }

            this.windows.forEach(

                item => {

                    item.focused =

                        false;

                    if (

                        item.element

                    ) {

                        item.element.classList.remove(

                            "is-focused"

                        );

                    }

                }

            );

            this.zIndex++;

            target.focused =

                true;

            this.activeWindow =

                appId;

            target.element.style.zIndex =

                String(

                    this.zIndex

                );

            target.element.classList.add(

                "is-focused"

            );

            this.emit(

                "window-focused",

                target

            );

            return true;

        },

        /* ====================================================

           MINIMIZE

           ==================================================== */

        minimize(

            appId

        ) {

            const target =

                this.windows.get(

                    appId

                );

            if (

                !target

            ) {

                return false;

            }

            target.minimized =

                true;

            target.element.classList.add(

                "is-minimized"

            );

            this.emit(

                "window-minimized",

                target

            );

            return true;

        },

        /* ====================================================

           RESTORE

           ==================================================== */

        restore(

            appId

        ) {

            const target =

                this.windows.get(

                    appId

                );

            if (

                !target

            ) {

                return false;

            }

            target.minimized =

                false;

            target.element.classList.remove(

                "is-minimized"

            );

            this.focus(

                appId

            );

            this.emit(

                "window-restored",

                target

            );

            return true;

        },

        /* ====================================================

           MAXIMIZE

           ==================================================== */

        maximize(

            appId

        ) {

            const target =

                this.windows.get(

                    appId

                );

            if (

                !target

            ) {

                return false;

            }

            target.maximized =

                true;

            target.element.classList.add(

                "is-maximized"

            );

            this.focus(

                appId

            );

            this.emit(

                "window-maximized",

                target

            );

            return true;

        },

        /* ====================================================

           TOGGLE MAXIMIZE

           ==================================================== */

        toggleMaximize(

            appId

        ) {

            const target =

                this.windows.get(

                    appId

                );

            if (

                !target

            ) {

                return false;

            }

            if (

                target.maximized

            ) {

                return this.restoreSize(

                    appId

                );

            }

            return this.maximize(

                appId

            );

        },

        /* ====================================================

           RESTORE SIZE

           ==================================================== */

        restoreSize(

            appId

        ) {

            const target =

                this.windows.get(

                    appId

                );

            if (

                !target

            ) {

                return false;

            }

            target.maximized =

                false;

            target.element.classList.remove(

                "is-maximized"

            );

            this.focus(

                appId

            );

            this.emit(

                "window-size-restored",

                target

            );

            return true;

        },

        /* ====================================================

           SCHLIESSEN

           ==================================================== */

        close(

            appId

        ) {

            const target =

                this.windows.get(

                    appId

                );

            if (

                !target

            ) {

                return false;

            }

            if (

                target.element

            ) {

                target.element.remove();

            }

            this.windows.delete(

                appId

            );

            if (

                this.activeWindow ===

                appId

            ) {

                this.activeWindow =

                    null;

                const remaining =

                    [

                        ...this.windows.keys()

                    ];

                if (

                    remaining.length >

                    0

                ) {

                    this.focus(

                        remaining[

                            remaining.length - 1

                        ]

                    );

                }

            }

            if (

                this.appManager

            ) {

                this.appManager.close(

                    appId

                );

            }

            this.emit(

                "window-closed",

                {

                    appId

                }

            );

            return true;

        },

        /* ====================================================

           ALLE SCHLIESSEN

           ==================================================== */

        closeAll() {

            const ids =

                [

                    ...this.windows.keys()

                ];

            ids.forEach(

                id => {

                    this.close(

                        id

                    );

                }

            );

            return true;

        },

        /* ====================================================

           MINIMIEREN ALLE

           ==================================================== */

        minimizeAll() {

            this.windows.forEach(

                item => {

                    this.minimize(

                        item.appId

                    );

                }

            );

            return true;

        },

        /* ====================================================

           MAXIMIEREN ALLE

           ==================================================== */

        maximizeAll() {

            this.windows.forEach(

                item => {

                    this.maximize(

                        item.appId

                    );

                }

            );

            return true;

        },

        /* ====================================================

           GET WINDOW

           ==================================================== */

        get(

            appId

        ) {

            return this.windows.get(

                appId

            ) || null;

        },

        /* ====================================================

           GET ALL

           ==================================================== */

        getAll() {

            return [

                ...this.windows.values()

            ];

        },

        /* ====================================================

           GET RUNNING

           ==================================================== */

        getRunning() {

            return this.getAll();

        },

        /* ====================================================

           IS OPEN

           ==================================================== */

        isOpen(

            appId

        ) {

            return this.windows.has(

                appId

            );

        },

        /* ====================================================

           AKTIVES FENSTER

           ==================================================== */

        getActive() {

            if (

                !this.activeWindow

            ) {

                return null;

            }

            return this.get(

                this.activeWindow

            );

        },

        /* ====================================================

           STATUS

           ==================================================== */

        getStatus() {

            return {

                name:

                    this.name,

                version:

                    this.version,

                status:

                    this.status,

                initialized:

                    this.initialized,

                windowCount:

                    this.windows.size,

                activeWindow:

                    this.activeWindow,

                zIndex:

                    this.zIndex

            };

        },

        /* ====================================================

           EVENTS

           ==================================================== */

        on(

            eventName,

            callback

        ) {

            if (

                typeof callback !==

                "function"

            ) {

                return false;

            }

            if (

                !this.listeners.has(

                    eventName

                )

            ) {

                this.listeners.set(

                    eventName,

                    []

                );

            }

            this.listeners

                .get(

                    eventName

                )

                .push(

                    callback

                );

            return true;

        },

        /* ====================================================

           OFF

           ==================================================== */

        off(

            eventName,

            callback

        ) {

            const listeners =

                this.listeners.get(

                    eventName

                );

            if (

                !listeners

            ) {

                return false;

            }

            const index =

                listeners.indexOf(

                    callback

                );

            if (

                index ===

                -1

            ) {

                return false;

            }

            listeners.splice(

                index,

                1

            );

            return true;

        },

        /* ====================================================

           EMIT

           ==================================================== */

        emit(

            eventName,

            data = null

        ) {

            const listeners =

                this.listeners.get(

                    eventName

                );

            if (

                !listeners

            ) {

                return;

            }

            listeners

                .slice()

                .forEach(

                    callback => {

                        try {

                            callback(

                                data

                            );

                        } catch (

                            error

                        ) {

                            console.error(

                                "[HalDo Window Manager]",

                                error

                            );

                        }

                    }

                );

        },

        /* ====================================================

           LOG

           ==================================================== */

        log(

            message,

            data = null

        ) {

            if (

                data !== null

            ) {

                console.log(

                    "[HalDo Window Manager]",

                    message,

                    data

                );

            } else {

                console.log(

                    "[HalDo Window Manager]",

                    message

                );

            }

        }

    };

    /* ========================================================

       GLOBAL

       ======================================================== */

    window.HalDoWindowManager =

        HalDoWindowManager;

    if (

        !window.HalDo

    ) {

        window.HalDo = {};

    }

    window.HalDo.windows =

        HalDoWindowManager;

    /* ========================================================

       START

       ======================================================== */

    function start() {

        HalDoWindowManager.initialize();

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

    console.log(

        "=============================================="

    );

    console.log(

        "HalDo AI OS 18 Window Manager"

    );

    console.log(

        "Fensterverwaltung geladen."

    );

    console.log(

        "=============================================="

    );

})(window);