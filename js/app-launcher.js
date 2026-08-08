/*
============================================================
 HALDO AI OS 18
 APP LAUNCHER
 Professional Ultimate Foundation
============================================================

 Datei:
 js/app-launcher.js

 Aufgabe:
 - App-Menü
 - App-Suche
 - App-Kategorien
 - Favoriten
 - zuletzt verwendete Apps
 - App öffnen
 - App schließen
 - Launcher-Zustand
 - Verbindung mit App Manager
 - Vorbereitung für Hauptmenü / Home Screen
============================================================
*/

"use strict";


(function (window) {


    /* ========================================================
       APP LAUNCHER
       ======================================================== */

    const HalDoAppLauncher = {


        name:
            "HalDo App Launcher",

        version:
            "18.0.0",

        status:
            "CREATED",

        initialized:
            false,

        visible:
            false,

        manager:
            null,

        registry:
            null,

        container:
            null,

        currentView:
            "all",

        searchQuery:
            "",

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


            this.initialized =
                true;


            this.status =
                "READY";


            this.emit(
                "ready",
                this.getStatus()
            );


            this.log(
                "App Launcher ist bereit."
            );


            return true;

        },


        /* ====================================================
           VERBINDUNG
           ==================================================== */

        connect() {


            this.manager =
                window.HalDoAppManager ||
                null;


            this.registry =
                window.HalDoAppRegistry ||
                null;


            return true;

        },


        /* ====================================================
           MANAGER ERNEUT VERBINDEN
           ==================================================== */

        reconnect() {


            this.connect();


            return Boolean(
                this.manager
            );

        },


        /* ====================================================
           CONTAINER SETZEN
           ==================================================== */

        setContainer(
            element
        ) {


            if (
                typeof element ===
                "string"
            ) {

                element =
                    document.querySelector(
                        element
                    );

            }


            if (
                !element
            ) {

                return false;

            }


            this.container =
                element;


            this.render();


            return true;

        },


        /* ====================================================
           CONTAINER ERSTELLEN
           ==================================================== */

        createContainer() {


            if (
                this.container
            ) {

                return this.container;

            }


            const container =
                document.createElement(
                    "section"
                );


            container.className =
                "haldo-app-launcher";


            container.setAttribute(
                "data-haldo-app-launcher",
                "true"
            );


            container.setAttribute(
                "aria-label",
                "HalDo App Launcher"
            );


            document.body.appendChild(
                container
            );


            this.container =
                container;


            return container;

        },


        /* ====================================================
           ÖFFNEN
           ==================================================== */

        open() {


            this.reconnect();


            if (
                !this.container
            ) {

                this.createContainer();

            }


            this.visible =
                true;


            this.container.classList.add(
                "is-visible"
            );


            this.container.setAttribute(
                "aria-hidden",
                "false"
            );


            this.render();


            this.emit(
                "opened",
                this.getStatus()
            );


            return true;

        },


        /* ====================================================
           SCHLIESSEN
           ==================================================== */

        close() {


            if (
                !this.container
            ) {

                this.visible =
                    false;

                return true;

            }


            this.visible =
                false;


            this.container.classList.remove(
                "is-visible"
            );


            this.container.setAttribute(
                "aria-hidden",
                "true"
            );


            this.emit(
                "closed",
                this.getStatus()
            );


            return true;

        },


        /* ====================================================
           TOGGLE
           ==================================================== */

        toggle() {


            if (
                this.visible
            ) {

                return this.close();

            }


            return this.open();

        },


        /* ====================================================
           SUCHEN
           ==================================================== */

        search(
            query
        ) {


            this.searchQuery =
                String(
                    query ||
                    ""
                );


            this.currentView =
                "search";


            this.render();


            this.emit(
                "search",
                {

                    query:
                        this.searchQuery

                }
            );


            return this.getApps();

        },


        /* ====================================================
           SUCHE ZURÜCKSETZEN
           ==================================================== */

        clearSearch() {


            this.searchQuery =
                "";


            this.currentView =
                "all";


            this.render();


            return true;

        },


        /* ====================================================
           KATEGORIE
           ==================================================== */

        showCategory(
            category
        ) {


            this.currentView =
                category;


            this.searchQuery =
                "";


            this.render();


            this.emit(
                "category",
                {

                    category

                }
            );


            return true;

        },


        /* ====================================================
           ALLE APPS
           ==================================================== */

        showAll() {


            this.currentView =
                "all";


            this.searchQuery =
                "";


            this.render();


            return true;

        },


        /* ====================================================
           FAVORITEN
           ==================================================== */

        showFavorites() {


            this.currentView =
                "favorites";


            this.searchQuery =
                "";


            this.render();


            return true;

        },


        /* ====================================================
           RECENT
           ==================================================== */

        showRecent() {


            this.currentView =
                "recent";


            this.searchQuery =
                "";


            this.render();


            return true;

        },


        /* ====================================================
           APPS ABRUFEN
           ==================================================== */

        getApps() {


            this.reconnect();


            if (
                !this.manager
            ) {

                return [];

            }


            if (
                this.currentView ===
                "favorites"
            ) {

                return this.manager
                    .getFavorites();

            }


            if (
                this.currentView ===
                "recent"
            ) {

                return this.manager
                    .getRecent(20);

            }


            if (
                this.currentView ===
                "all"
            ) {

                if (
                    this.searchQuery
                ) {

                    return this.manager
                        .search(
                            this.searchQuery
                        );

                }


                return this.manager
                    .getAll();

            }


            if (
                this.currentView ===
                "search"
            ) {

                return this.manager
                    .search(
                        this.searchQuery
                    );

            }


            return this.manager
                .getByCategory(
                    this.currentView
                );

        },


        /* ====================================================
           APP ÖFFNEN
           ==================================================== */

        async openApp(
            id
        ) {


            this.reconnect();


            if (
                !this.manager
            ) {

                return false;

            }


            const success =
                await this.manager.open(
                    id
                );


            if (
                success
            ) {

                this.emit(
                    "app-opened",
                    {

                        id

                    }
                );

            }


            return success;

        },


        /* ====================================================
           APP SCHLIESSEN
           ==================================================== */

        async closeApp(
            id
        ) {


            this.reconnect();


            if (
                !this.manager
            ) {

                return false;

            }


            return this.manager.close(
                id
            );

        },


        /* ====================================================
           FAVORIT TOGGLE
           ==================================================== */

        toggleFavorite(
            id
        ) {


            this.reconnect();


            if (
                !this.manager
            ) {

                return false;

            }


            const favorite =
                this.manager.isFavorite(
                    id
                );


            const result =
                this.manager.setFavorite(
                    id,
                    !favorite
                );


            if (
                result
            ) {

                this.render();

            }


            return result;

        },


        /* ====================================================
           RENDER
           ==================================================== */

        render() {


            if (
                !this.container
            ) {

                return false;

            }


            this.reconnect();


            const apps =
                this.getApps();


            this.container.innerHTML =
                "";


            /*
            ----------------------------------------------------
            HEADER
            ----------------------------------------------------
            */

            const header =
                document.createElement(
                    "div"
                );


            header.className =
                "haldo-launcher-header";


            const title =
                document.createElement(
                    "div"
                );


            title.className =
                "haldo-launcher-title";


            title.textContent =
                "HalDo AI OS";


            header.appendChild(
                title
            );


            /*
            ----------------------------------------------------
            SEARCH
            ----------------------------------------------------
            */

            const search =
                document.createElement(
                    "input"
                );


            search.className =
                "haldo-launcher-search";


            search.type =
                "search";


            search.placeholder =
                "Apps suchen…";


            search.value =
                this.searchQuery;


            search.setAttribute(
                "aria-label",
                "Apps suchen"
            );


            search.addEventListener(
                "input",
                event => {

                    this.search(
                        event.target.value
                    );

                }
            );


            header.appendChild(
                search
            );


            /*
            ----------------------------------------------------
            CLOSE BUTTON
            ----------------------------------------------------
            */

            const close =
                document.createElement(
                    "button"
                );


            close.className =
                "haldo-launcher-close";


            close.type =
                "button";


            close.textContent =
                "×";


            close.setAttribute(
                "aria-label",
                "App Launcher schließen"
            );


            close.addEventListener(
                "click",
                () => {

                    this.close();

                }
            );


            header.appendChild(
                close
            );


            this.container.appendChild(
                header
            );


            /*
            ----------------------------------------------------
            NAVIGATION
            ----------------------------------------------------
            */

            const navigation =
                document.createElement(
                    "nav"
                );


            navigation.className =
                "haldo-launcher-navigation";


            const navigationItems = [

                {
                    id: "all",
                    label: "Alle"
                },

                {
                    id: "favorites",
                    label: "Favoriten"
                },

                {
                    id: "recent",
                    label: "Zuletzt"
                },

                {
                    id: "ai",
                    label: "AI"
                },

                {
                    id: "system",
                    label: "System"
                },

                {
                    id: "productivity",
                    label: "Produktivität"
                },

                {
                    id: "communication",
                    label: "Kommunikation"
                },

                {
                    id: "media",
                    label: "Medien"
                },

                {
                    id: "language",
                    label: "Sprache"
                },

                {
                    id: "ezidi",
                    label: "Êzîdî"
                },

                {
                    id: "security",
                    label: "Sicherheit"
                }

            ];


            navigationItems.forEach(
                item => {


                    const button =
                        document.createElement(
                            "button"
                        );


                    button.type =
                        "button";


                    button.className =
                        "haldo-launcher-nav-button";


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


                            if (
                                item.id ===
                                "all"
                            ) {

                                this.showAll();

                            } else if (
                                item.id ===
                                "favorites"
                            ) {

                                this.showFavorites();

                            } else if (
                                item.id ===
                                "recent"
                            ) {

                                this.showRecent();

                            } else {

                                this.showCategory(
                                    item.id
                                );

                            }

                        }
                    );


                    navigation.appendChild(
                        button
                    );

                }
            );


            this.container.appendChild(
                navigation
            );


            /*
            ----------------------------------------------------
            APP GRID
            ----------------------------------------------------
            */

            const grid =
                document.createElement(
                    "div"
                );


            grid.className =
                "haldo-app-grid";


            if (
                apps.length ===
                0
            ) {


                const empty =
                    document.createElement(
                        "div"
                    );


                empty.className =
                    "haldo-app-empty";


                empty.textContent =
                    "Keine Apps gefunden.";


                grid.appendChild(
                    empty
                );


            } else {


                apps.forEach(
                    app => {


                        grid.appendChild(
                            this.createAppCard(
                                app
                            )
                        );

                    }
                );

            }


            this.container.appendChild(
                grid
            );


            return true;

        },


        /* ====================================================
           APP CARD
           ==================================================== */

        createAppCard(
            app
        ) {


            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "haldo-app-card";


            card.dataset.appId =
                app.id;


            /*
            ----------------------------------------------------
            ICON
            ----------------------------------------------------
            */

            const icon =
                document.createElement(
                    "div"
                );


            icon.className =
                "haldo-app-icon";


            if (
                typeof app.icon ===
                "string" &&
                (
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


                image.loading =
                    "lazy";


                icon.appendChild(
                    image
                );


            } else {


                icon.textContent =
                    app.icon ||
                    "▦";

            }


            /*
            ----------------------------------------------------
            NAME
            ----------------------------------------------------
            */

            const name =
                document.createElement(
                    "div"
                );


            name.className =
                "haldo-app-name";


            name.textContent =
                app.name;


            /*
            ----------------------------------------------------
            CATEGORY
            ----------------------------------------------------
            */

            const category =
                document.createElement(
                    "div"
                );


            category.className =
                "haldo-app-category";


            category.textContent =
                app.category;


            /*
            ----------------------------------------------------
            FAVORITE
            ----------------------------------------------------
            */

            const favorite =
                document.createElement(
                    "button"
                );


            favorite.type =
                "button";


            favorite.className =
                "haldo-app-favorite";


            favorite.textContent =
                this.manager &&
                this.manager.isFavorite(
                    app.id
                )
                    ? "★"
                    : "☆";


            favorite.setAttribute(
                "aria-label",
                "Favorit"
            );


            favorite.addEventListener(
                "click",
                event => {


                    event.stopPropagation();


                    this.toggleFavorite(
                        app.id
                    );

                }
            );


            /*
            ----------------------------------------------------
            CARD ZUSAMMENSETZEN
            ----------------------------------------------------
            */

            card.appendChild(
                icon
            );

            card.appendChild(
                name
            );

            card.appendChild(
                category
            );

            card.appendChild(
                favorite
            );


            /*
            ----------------------------------------------------
            OPEN
            ----------------------------------------------------
            */

            card.addEventListener(
                "click",
                () => {

                    this.openApp(
                        app.id
                    );

                }
            );


            return card;

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

                visible:
                    this.visible,

                currentView:
                    this.currentView,

                searchQuery:
                    this.searchQuery,

                appCount:
                    this.manager
                        ? this.manager.getAll().length
                        : 0

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
                .get(eventName)
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
                                "[HalDo App Launcher]",
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
                    "[HalDo App Launcher]",
                    message,
                    data
                );

            } else {

                console.log(
                    "[HalDo App Launcher]",
                    message
                );

            }

        }

    };


    /* ========================================================
       GLOBAL API
       ======================================================== */

    window.HalDoAppLauncher =
        HalDoAppLauncher;


    if (
        !window.HalDo
    ) {

        window.HalDo = {};

    }


    window.HalDo.appLauncher =
        HalDoAppLauncher;


    /* ========================================================
       START
       ======================================================== */

    function start() {


        HalDoAppLauncher.initialize();


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
        "HalDo AI OS 18 App Launcher"
    );

    console.log(
        "App Launcher geladen."
    );

    console.log(
        "=============================================="
    );


})(window);