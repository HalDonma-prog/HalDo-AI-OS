/*

============================================================

 HALDO AI OS 18

 DESKTOP MANAGER

 Professional Ultimate Foundation

============================================================

 Datei:

 js/desktop-manager.js

 Aufgabe:

 - HalDo Desktop verwalten

 - Desktop-Bereich aufbauen

 - Schnellzugriff

 - Desktop-Apps

 - Verbindung mit App Launcher

 - Verbindung mit Window Manager

 - responsive Vorbereitung

 - Statusverwaltung

============================================================

*/

"use strict";

(function (window) {

    /* ========================================================

       DESKTOP MANAGER

       ======================================================== */

    const HalDoDesktopManager = {

        name:

            "HalDo Desktop Manager",

        version:

            "18.0.0",

        status:

            "CREATED",

        initialized:

            false,

        /* ====================================================

           VERBINDUNGEN

           ==================================================== */

        launcher:

            null,

        windowManager:

            null,

        appManager:

            null,

        registry:

            null,

        /* ====================================================

           ELEMENTE

           ==================================================== */

        desktop:

            null,

        desktopLayer:

            null,

        quickAccess:

            null,

        statusBar:

            null,

        /* ====================================================

           EINSTELLUNGEN

           ==================================================== */

        showQuickAccess:

            true,

        showStatusBar:

            true,

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

            this.createDesktopLayer();

            this.createQuickAccess();

            this.createStatusBar();

            this.bindEvents();

            this.initialized =

                true;

            this.status =

                "READY";

            this.emit(

                "ready",

                this.getStatus()

            );

            this.log(

                "Desktop Manager ist bereit."

            );

            return true;

        },

        /* ====================================================

           VERBINDUNGEN

           ==================================================== */

        connect() {

            this.launcher =

                window.HalDoAppLauncher ||

                null;

            this.windowManager =

                window.HalDoWindowManager ||

                null;

            this.appManager =

                window.HalDoAppManager ||

                null;

            this.registry =

                window.HalDoAppRegistry ||

                null;

            return true;

        },

        /* ====================================================

           DESKTOP

           ==================================================== */

        createDesktop() {

            let desktop =

                document.querySelector(

                    "[data-haldo-desktop-shell]"

                );

            if (

                !desktop

            ) {

                desktop =

                    document.createElement(

                        "div"

                    );

                desktop.id =

                    "haldo-desktop-shell";

                desktop.className =

                    "haldo-desktop-shell";

                desktop.setAttribute(

                    "data-haldo-desktop-shell",

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

           DESKTOP LAYER

           ==================================================== */

        createDesktopLayer() {

            if (

                !this.desktop

            ) {

                this.createDesktop();

            }

            let layer =

                this.desktop.querySelector(

                    "[data-haldo-desktop-layer]"

                );

            if (

                !layer

            ) {

                layer =

                    document.createElement(

                        "div"

                    );

                layer.className =

                    "haldo-desktop-layer";

                layer.setAttribute(

                    "data-haldo-desktop-layer",

                    "true"

                );

                this.desktop.appendChild(

                    layer

                );

            }

            this.desktopLayer =

                layer;

            return layer;

        },

        /* ====================================================

           QUICK ACCESS

           ==================================================== */

        createQuickAccess() {

            if (

                !this.showQuickAccess

            ) {

                return null;

            }

            if (

                !this.desktop

            ) {

                this.createDesktop();

            }

            let quickAccess =

                this.desktop.querySelector(

                    "[data-haldo-quick-access]"

                );

            if (

                !quickAccess

            ) {

                quickAccess =

                    document.createElement(

                        "aside"

                    );

                quickAccess.className =

                    "haldo-quick-access";

                quickAccess.setAttribute(

                    "data-haldo-quick-access",

                    "true"

                );

                this.desktop.appendChild(

                    quickAccess

                );

            }

            this.quickAccess =

                quickAccess;

            this.renderQuickAccess();

            return quickAccess;

        },

        /* ====================================================

           QUICK ACCESS RENDERN

           ==================================================== */

        renderQuickAccess() {

            if (

                !this.quickAccess

            ) {

                return false;

            }

            this.quickAccess.innerHTML =

                "";

            const title =

                document.createElement(

                    "div"

                );

            title.className =

                "haldo-quick-access-title";

            title.textContent =

                "Schnellzugriff";

            this.quickAccess.appendChild(

                title

            );

            const apps = [

                {

                    id:

                        "ai-assistant",

                    label:

                        "HalDo AI"

                },

                {

                    id:

                        "app-center",

                    label:

                        "Apps"

                },

                {

                    id:

                        "text-editor",

                    label:

                        "Editor"

                },

                {

                    id:

                        "gallery",

                    label:

                        "Galerie"

                },

                {

                    id:

                        "todo",

                    label:

                        "Aufgaben"

                },

                {

                    id:

                        "control-center",

                    label:

                        "Kontrolle"

                }

            ];

            const available =

                apps.filter(

                    item =>

                        this.hasApp(

                            item.id

                        )

                );

            available.forEach(

                item => {

                    const button =

                        document.createElement(

                            "button"

                        );

                    button.type =

                        "button";

                    button.className =

                        "haldo-quick-access-button";

                    button.dataset.appId =

                        item.id;

                    button.textContent =

                        item.label;

                    button.addEventListener(

                        "click",

                        () => {

                            this.openApp(

                                item.id

                            );

                        }

                    );

                    this.quickAccess.appendChild(

                        button

                    );

                }

            );

            return true;

        },

        /* ====================================================

           STATUS BAR

           ==================================================== */

        createStatusBar() {

            if (

                !this.showStatusBar

            ) {

                return null;

            }

            if (

                !this.desktop

            ) {

                this.createDesktop();

            }

            let bar =

                this.desktop.querySelector(

                    "[data-haldo-status-bar]"

                );

            if (

                !bar

            ) {

                bar =

                    document.createElement(

                        "footer"

                    );

                bar.className =

                    "haldo-status-bar";

                bar.setAttribute(

                    "data-haldo-status-bar",

                    "true"

                );

                this.desktop.appendChild(

                    bar

                );

            }

            this.statusBar =

                bar;

            this.renderStatusBar();

            return bar;

        },

        /* ====================================================

           STATUS BAR RENDERN

           ==================================================== */

        renderStatusBar() {

            if (

                !this.statusBar

            ) {

                return false;

            }

            this.statusBar.innerHTML =

                "";

            const left =

                document.createElement(

                    "div"

                );

            left.className =

                "haldo-status-left";

            left.textContent =

                "HalDo AI OS 18";

            const center =

                document.createElement(

                    "div"

                );

            center.className =

                "haldo-status-center";

            center.textContent =

                "Bereit";

            const right =

                document.createElement(

                    "div"

                );

            right.className =

                "haldo-status-right";

            right.textContent =

                this.getTime();

            this.statusBar.appendChild(

                left

            );

            this.statusBar.appendChild(

                center

            );

            this.statusBar.appendChild(

                right

            );

            return true;

        },

        /* ====================================================

           UHRZEIT

           ==================================================== */

        getTime() {

            const now =

                new Date();

            return now.toLocaleTimeString(

                "de-DE",

                {

                    hour:

                        "2-digit",

                    minute:

                        "2-digit"

                }

            );

        },

        /* ====================================================

           APP VORHANDEN?

           ==================================================== */

        hasApp(

            id

        ) {

            if (

                !this.appManager

            ) {

                this.connect();

            }

            if (

                !this.appManager

            ) {

                return false;

            }

            return this.appManager.has(

                id

            );

        },

        /* ====================================================

           APP ÖFFNEN

           ==================================================== */

        openApp(

            id

        ) {

            this.connect();

            /*

            ----------------------------------------------------

            Window Manager bevorzugen

            ----------------------------------------------------

            */

            if (

                this.windowManager

            ) {

                const result =

                    this.windowManager.open(

                        id

                    );

                if (

                    result

                ) {

                    this.emit(

                        "app-opened",

                        {

                            id

                        }

                    );

                    return result;

                }

            }

            /*

            ----------------------------------------------------

            Launcher als Fallback

            ----------------------------------------------------

            */

            if (

                this.launcher

            ) {

                return this.launcher.openApp(

                    id

                );

            }

            return false;

        },

        /* ====================================================

           LAUNCHER ÖFFNEN

           ==================================================== */

        openLauncher() {

            this.connect();

            if (

                !this.launcher

            ) {

                return false;

            }

            return this.launcher.open();

        },

        /* ====================================================

           WINDOW MANAGER ÖFFNEN

           ==================================================== */

        openWindow(

            id,

            options = {}

        ) {

            this.connect();

            if (

                !this.windowManager

            ) {

                return false;

            }

            return this.windowManager.open(

                id,

                options

            );

        },

        /* ====================================================

           DESKTOP REFRESH

           ==================================================== */

        refresh() {

            this.connect();

            this.renderQuickAccess();

            this.renderStatusBar();

            this.emit(

                "refreshed",

                this.getStatus()

            );

            return true;

        },

        /* ====================================================

           DESKTOP SICHTBAR

           ==================================================== */

        show() {

            if (

                !this.desktop

            ) {

                this.createDesktop();

            }

            this.desktop.classList.add(

                "is-visible"

            );

            this.desktop.setAttribute(

                "aria-hidden",

                "false"

            );

            return true;

        },

        /* ====================================================

           DESKTOP VERSTECKEN

           ==================================================== */

        hide() {

            if (

                !this.desktop

            ) {

                return false;

            }

            this.desktop.classList.remove(

                "is-visible"

            );

            this.desktop.setAttribute(

                "aria-hidden",

                "true"

            );

            return true;

        },

        /* ====================================================

           EVENT-BINDINGS

           ==================================================== */

        bindEvents() {

            /*

            ----------------------------------------------------

            Launcher Ready

            ----------------------------------------------------

            */

            window.addEventListener(

                "haldo:launcher-ready",

                () => {

                    this.connect();

                    this.refresh();

                }

            );

            /*

            ----------------------------------------------------

            App Registry

            ----------------------------------------------------

            */

            window.addEventListener(

                "haldo:app-registry-ready",

                () => {

                    this.connect();

                    this.refresh();

                }

            );

            /*

            ----------------------------------------------------

            Resize

            ----------------------------------------------------

            */

            window.addEventListener(

                "resize",

                () => {

                    this.handleResize();

                }

            );

            /*

            ----------------------------------------------------

            Keyboard

            ----------------------------------------------------

            */

            document.addEventListener(

                "keydown",

                event => {

                    /*

                    Ctrl + Space

                    öffnet Launcher

                    */

                    if (

                        event.ctrlKey &&

                        event.code ===

                        "Space"

                    ) {

                        event.preventDefault();

                        this.openLauncher();

                    }

                }

            );

            return true;

        },

        /* ====================================================

           RESIZE

           ==================================================== */

        handleResize() {

            const width =

                window.innerWidth;

            if (

                width <= 600

            ) {

                this.desktop.classList.add(

                    "is-mobile"

                );

            } else {

                this.desktop.classList.remove(

                    "is-mobile"

                );

            }

            if (

                width <= 900

            ) {

                this.desktop.classList.add(

                    "is-tablet"

                );

            } else {

                this.desktop.classList.remove(

                    "is-tablet"

                );

            }

            this.emit(

                "resize",

                {

                    width,

                    height:

                        window.innerHeight

                }

            );

            return true;

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

                hasDesktop:

                    Boolean(

                        this.desktop

                    ),

                hasQuickAccess:

                    Boolean(

                        this.quickAccess

                    ),

                hasStatusBar:

                    Boolean(

                        this.statusBar

                    ),

                viewport:

                    {

                        width:

                            window.innerWidth,

                        height:

                            window.innerHeight

                    }

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

                                "[HalDo Desktop Manager]",

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

                    "[HalDo Desktop Manager]",

                    message,

                    data

                );

            } else {

                console.log(

                    "[HalDo Desktop Manager]",

                    message

                );

            }

        }

    };

    /* ========================================================

       GLOBAL API

       ======================================================== */

    window.HalDoDesktopManager =

        HalDoDesktopManager;

    if (

        !window.HalDo

    ) {

        window.HalDo = {};

    }

    window.HalDo.desktop =

        HalDoDesktopManager;

    /* ========================================================

       START

       ======================================================== */

    function start() {

        HalDoDesktopManager.initialize();

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

        "HalDo AI OS 18 Desktop Manager"

    );

    console.log(

        "Desktop Manager geladen."

    );

    console.log(

        "=============================================="

    );

})(window);