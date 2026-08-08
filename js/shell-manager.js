/*

============================================================

 HALDO AI OS 18

 SHELL MANAGER

 Professional Ultimate Foundation

============================================================

 Datei:

 js/shell-manager.js

 Aufgabe:

 - zentrale HalDo OS Oberfläche

 - Verbindung der UI-Systeme

 - Home Screen

 - Desktop

 - App Launcher

 - Window Manager

 - Navigation

 - Shell-Zustände

 - Systembereit-Status

 - Vorbereitung für Logo-Intro

 - Vorbereitung für AI-Begrüßung

============================================================

*/

"use strict";

(function (window) {

    /* ========================================================

       HALDO SHELL MANAGER

       ======================================================== */

    const HalDoShellManager = {

        name:

            "HalDo Shell Manager",

        version:

            "18.0.0",

        status:

            "CREATED",

        initialized:

            false,

        ready:

            false,

        /* ====================================================

           SYSTEMVERBINDUNGEN

           ==================================================== */

        kernel:

            null,

        system:

            null,

        bootManager:

            null,

        appManager:

            null,

        appLauncher:

            null,

        windowManager:

            null,

        desktopManager:

            null,

        configManager:

            null,

        /* ====================================================

           UI ELEMENTE

           ==================================================== */

        root:

            null,

        shell:

            null,

        home:

            null,

        navigation:

            null,

        content:

            null,

        /* ====================================================

           AKTUELLER BEREICH

           ==================================================== */

        currentView:

            "home",

        /* ====================================================

           SHELL SICHTBARKEIT

           ==================================================== */

        visible:

            false,

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

            this.createRoot();

            this.createShell();

            this.createHome();

            this.createNavigation();

            this.createContent();

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

                "HalDo Shell ist bereit."

            );

            return true;

        },

        /* ====================================================

           SYSTEMVERBINDUNGEN

           ==================================================== */

        connect() {

            this.kernel =

                window.HalDoKernel ||

                null;

            this.system =

                window.HalDoSystem ||

                null;

            this.bootManager =

                window.HalDoBootManager ||

                null;

            this.appManager =

                window.HalDoAppManager ||

                null;

            this.appLauncher =

                window.HalDoAppLauncher ||

                null;

            this.windowManager =

                window.HalDoWindowManager ||

                null;

            this.desktopManager =

                window.HalDoDesktopManager ||

                null;

            this.configManager =

                window.HalDoConfigManager ||

                null;

            return true;

        },

        /* ====================================================

           ROOT

           ==================================================== */

        createRoot() {

            let root =

                document.querySelector(

                    "[data-haldo-root]"

                );

            if (

                !root

            ) {

                root =

                    document.createElement(

                        "div"

                    );

                root.id =

                    "haldo-root";

                root.setAttribute(

                    "data-haldo-root",

                    "true"

                );

                document.body.appendChild(

                    root

                );

            }

            this.root =

                root;

            return root;

        },

        /* ====================================================

           SHELL

           ==================================================== */

        createShell() {

            if (

                !this.root

            ) {

                this.createRoot();

            }

            let shell =

                this.root.querySelector(

                    "[data-haldo-shell]"

                );

            if (

                !shell

            ) {

                shell =

                    document.createElement(

                        "div"

                    );

                shell.id =

                    "haldo-shell";

                shell.className =

                    "haldo-shell";

                shell.setAttribute(

                    "data-haldo-shell",

                    "true"

                );

                this.root.appendChild(

                    shell

                );

            }

            this.shell =

                shell;

            return shell;

        },

        /* ====================================================

           HOME

           ==================================================== */

        createHome() {

            if (

                !this.shell

            ) {

                this.createShell();

            }

            let home =

                this.shell.querySelector(

                    "[data-haldo-home]"

                );

            if (

                !home

            ) {

                home =

                    document.createElement(

                        "section"

                    );

                home.id =

                    "haldo-home";

                home.className =

                    "haldo-home";

                home.setAttribute(

                    "data-haldo-home",

                    "true"

                );

                this.shell.appendChild(

                    home

                );

            }

            this.home =

                home;

            this.renderHome();

            return home;

        },

        /* ====================================================

           HOME RENDERN

           ==================================================== */

        renderHome() {

            if (

                !this.home

            ) {

                return false;

            }

            this.home.innerHTML =

                "";

            /*

            ----------------------------------------------------

            LOGO

            ----------------------------------------------------

            */

            const logoArea =

                document.createElement(

                    "div"

                );

            logoArea.className =

                "haldo-home-logo";

            const logo =

                document.createElement(

                    "img"

                );

            logo.src =

                "assets/logo/logo.png";

            logo.alt =

                "HalDo AI";

            logo.className =

                "haldo-home-logo-image";

            logoArea.appendChild(

                logo

            );

            /*

            ----------------------------------------------------

            TITLE

            ----------------------------------------------------

            */

            const title =

                document.createElement(

                    "h1"

                );

            title.className =

                "haldo-home-title";

            title.textContent =

                "HalDo AI OS 18";

            /*

            ----------------------------------------------------

            SUBTITLE

            ----------------------------------------------------

            */

            const subtitle =

                document.createElement(

                    "p"

                );

            subtitle.className =

                "haldo-home-subtitle";

            subtitle.textContent =

                "Professional Ultimate Foundation";

            /*

            ----------------------------------------------------

            WELCOME

            ----------------------------------------------------

            */

            const welcome =

                document.createElement(

                    "p"

                );

            welcome.className =

                "haldo-home-welcome";

            welcome.textContent =

                "Willkommen bei HalDo AI OS.";

            /*

            ----------------------------------------------------

            QUICK ACTIONS

            ----------------------------------------------------

            */

            const actions =

                document.createElement(

                    "div"

                );

            actions.className =

                "haldo-home-actions";

            const launcherButton =

                this.createActionButton(

                    "Apps öffnen",

                    "open-launcher"

                );

            const aiButton =

                this.createActionButton(

                    "HalDo AI",

                    "open-ai"

                );

            const controlButton =

                this.createActionButton(

                    "Kontrollzentrum",

                    "open-control"

                );

            actions.appendChild(

                launcherButton

            );

            actions.appendChild(

                aiButton

            );

            actions.appendChild(

                controlButton

            );

            this.home.appendChild(

                logoArea

            );

            this.home.appendChild(

                title

            );

            this.home.appendChild(

                subtitle

            );

            this.home.appendChild(

                welcome

            );

            this.home.appendChild(

                actions

            );

            return true;

        },

        /* ====================================================

           ACTION BUTTON

           ==================================================== */

        createActionButton(

            label,

            action

        ) {

            const button =

                document.createElement(

                    "button"

                );

            button.type =

                "button";

            button.className =

                "haldo-home-action";

            button.dataset.action =

                action;

            button.textContent =

                label;

            button.addEventListener(

                "click",

                () => {

                    this.executeAction(

                        action

                    );

                }

            );

            return button;

        },

        /* ====================================================

           NAVIGATION

           ==================================================== */

        createNavigation() {

            if (

                !this.shell

            ) {

                return null;

            }

            let navigation =

                this.shell.querySelector(

                    "[data-haldo-navigation]"

                );

            if (

                !navigation

            ) {

                navigation =

                    document.createElement(

                        "nav"

                    );

                navigation.id =

                    "haldo-navigation";

                navigation.className =

                    "haldo-navigation";

                navigation.setAttribute(

                    "data-haldo-navigation",

                    "true"

                );

                this.shell.appendChild(

                    navigation

                );

            }

            this.navigation =

                navigation;

            this.renderNavigation();

            return navigation;

        },

        /* ====================================================

           NAVIGATION RENDERN

           ==================================================== */

        renderNavigation() {

            if (

                !this.navigation

            ) {

                return false;

            }

            this.navigation.innerHTML =

                "";

            const items = [

                {

                    id:

                        "home",

                    label:

                        "Start"

                },

                {

                    id:

                        "apps",

                    label:

                        "Apps"

                },

                {

                    id:

                        "ai",

                    label:

                        "HalDo AI"

                },

                {

                    id:

                        "desktop",

                    label:

                        "Desktop"

                },

                {

                    id:

                        "settings",

                    label:

                        "Einstellungen"

                }

            ];

            items.forEach(

                item => {

                    const button =

                        document.createElement(

                            "button"

                        );

                    button.type =

                        "button";

                    button.className =

                        "haldo-navigation-button";

                    button.dataset.view =

                        item.id;

                    if (

                        this.currentView ===

                        item.id

                    ) {

                        button.classList.add(

                            "active"

                        );

                    }

                    button.textContent =

                        item.label;

                    button.addEventListener(

                        "click",

                        () => {

                            this.navigate(

                                item.id

                            );

                        }

                    );

                    this.navigation.appendChild(

                        button

                    );

                }

            );

            return true;

        },

        /* ====================================================

           CONTENT

           ==================================================== */

        createContent() {

            if (

                !this.shell

            ) {

                return null;

            }

            let content =

                this.shell.querySelector(

                    "[data-haldo-content]"

                );

            if (

                !content

            ) {

                content =

                    document.createElement(

                        "main"

                    );

                content.id =

                    "haldo-content";

                content.className =

                    "haldo-content";

                content.setAttribute(

                    "data-haldo-content",

                    "true"

                );

                this.shell.appendChild(

                    content

                );

            }

            this.content =

                content;

            return content;

        },

        /* ====================================================

           NAVIGATION

           ==================================================== */

        navigate(

            view

        ) {

            this.currentView =

                view;

            this.renderNavigation();

            switch (

                view

            ) {

                case "home":

                    this.showHome();

                    break;

                case "apps":

                    this.openApps();

                    break;

                case "ai":

                    this.openAI();

                    break;

                case "desktop":

                    this.openDesktop();

                    break;

                case "settings":

                    this.openSettings();

                    break;

                default:

                    this.showHome();

                    break;

            }

            this.emit(

                "navigation",

                {

                    view

                }

            );

            return true;

        },

        /* ====================================================

           HOME ANZEIGEN

           ==================================================== */

        showHome() {

            if (

                this.home

            ) {

                this.home.classList.add(

                    "is-visible"

                );

            }

            if (

                this.content

            ) {

                this.content.innerHTML =

                    "";

            }

            this.visible =

                true;

            return true;

        },

        /* ====================================================

           APPS

           ==================================================== */

        openApps() {

            this.connect();

            if (

                this.appLauncher

            ) {

                this.appLauncher.open();

                return true;

            }

            return false;

        },

        /* ====================================================

           AI

           ==================================================== */

        openAI() {

            this.connect();

            if (

                this.windowManager &&

                this.appManager

            ) {

                if (

                    this.appManager.has(

                        "ai-assistant"

                    )

                ) {

                    this.windowManager.open(

                        "ai-assistant"

                    );

                    return true;

                }

            }

            return false;

        },

        /* ====================================================

           DESKTOP

           ==================================================== */

        openDesktop() {

            this.connect();

            if (

                this.desktopManager

            ) {

                this.desktopManager.show();

                return true;

            }

            return false;

        },

        /* ====================================================

           EINSTELLUNGEN

           ==================================================== */

        openSettings() {

            this.connect();

            if (

                this.windowManager &&

                this.appManager

            ) {

                if (

                    this.appManager.has(

                        "control-center"

                    )

                ) {

                    this.windowManager.open(

                        "control-center"

                    );

                    return true;

                }

            }

            return false;

        },

        /* ====================================================

           ACTION

           ==================================================== */

        executeAction(

            action

        ) {

            switch (

                action

            ) {

                case "open-launcher":

                    return this.openApps();

                case "open-ai":

                    return this.openAI();

                case "open-control":

                    return this.openSettings();

                default:

                    return false;

            }

        },

        /* ====================================================

           SHELL ÖFFNEN

           ==================================================== */

        show() {

            if (

                !this.shell

            ) {

                this.createShell();

            }

            this.visible =

                true;

            this.shell.classList.add(

                "is-visible"

            );

            this.shell.setAttribute(

                "aria-hidden",

                "false"

            );

            this.emit(

                "shown",

                this.getStatus()

            );

            return true;

        },

        /* ====================================================

           SHELL VERSTECKEN

           ==================================================== */

        hide() {

            if (

                !this.shell

            ) {

                return false;

            }

            this.visible =

                false;

            this.shell.classList.remove(

                "is-visible"

            );

            this.shell.setAttribute(

                "aria-hidden",

                "true"

            );

            this.emit(

                "hidden",

                this.getStatus()

            );

            return true;

        },

        /* ====================================================

           SYSTEM BEREIT

           ==================================================== */

        setReady() {

            this.ready =

                true;

            this.status =

                "SYSTEM_READY";

            this.emit(

                "system-ready",

                this.getStatus()

            );

            return true;

        },

        /* ====================================================

           EVENTS

           ==================================================== */

        bindEvents() {

            /*

            ----------------------------------------------------

            Kernel Ready

            ----------------------------------------------------

            */

            window.addEventListener(

                "haldo:kernel-ready",

                () => {

                    this.connect();

                }

            );

            /*

            ----------------------------------------------------

            System Ready

            ----------------------------------------------------

            */

            window.addEventListener(

                "haldo:system-ready",

                () => {

                    this.connect();

                    this.setReady();

                }

            );

            /*

            ----------------------------------------------------

            App Manager Ready

            ----------------------------------------------------

            */

            window.addEventListener(

                "haldo:app-manager-ready",

                () => {

                    this.connect();

                }

            );

            /*

            ----------------------------------------------------

            Launcher Ready

            ----------------------------------------------------

            */

            window.addEventListener(

                "haldo:launcher-ready",

                () => {

                    this.connect();

                }

            );

            /*

            ----------------------------------------------------

            Window Manager Ready

            ----------------------------------------------------

            */

            window.addEventListener(

                "haldo:window-manager-ready",

                () => {

                    this.connect();

                }

            );

            /*

            ----------------------------------------------------

            Desktop Ready

            ----------------------------------------------------

            */

            window.addEventListener(

                "haldo:desktop-ready",

                () => {

                    this.connect();

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

                ready:

                    this.ready,

                visible:

                    this.visible,

                currentView:

                    this.currentView,

                connections:

                    {

                        kernel:

                            Boolean(

                                this.kernel

                            ),

                        system:

                            Boolean(

                                this.system

                            ),

                        bootManager:

                            Boolean(

                                this.bootManager

                            ),

                        appManager:

                            Boolean(

                                this.appManager

                            ),

                        appLauncher:

                            Boolean(

                                this.appLauncher

                            ),

                        windowManager:

                            Boolean(

                                this.windowManager

                            ),

                        desktopManager:

                            Boolean(

                                this.desktopManager

                            ),

                        configManager:

                            Boolean(

                                this.configManager

                            )

                    }

            };

        },

        /* ====================================================

           EVENT ON

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

           EVENT OFF

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

           EVENT EMIT

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

                                "[HalDo Shell Manager]",

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

                    "[HalDo Shell Manager]",

                    message,

                    data

                );

            } else {

                console.log(

                    "[HalDo Shell Manager]",

                    message

                );

            }

        }

    };

    /* ========================================================

       GLOBALE API

       ======================================================== */

    window.HalDoShellManager =

        HalDoShellManager;

    if (

        !window.HalDo

    ) {

        window.HalDo = {};

    }

    window.HalDo.shell =

        HalDoShellManager;

    /* ========================================================

       START

       ======================================================== */

    function start() {

        HalDoShellManager.initialize();

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

        "HalDo AI OS 18 Shell Manager"

    );

    console.log(

        "Zentrale Shell geladen."

    );

    console.log(

        "=============================================="

    );

})(window);