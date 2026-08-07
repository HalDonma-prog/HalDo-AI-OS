/*
==========================================
HalDo AI OS 18
APP MANAGER
Professional Ultimate Foundation
Version 18.0.0
==========================================
*/

(function () {

    "use strict";

    const HalDoAppManager = {

        name: "HalDo App Manager",
        version: "18.0.0",

        status: "starting",

        apps: {},


        init() {

            if (this.status === "running") {
                return true;
            }

            this.status = "running";

            this.registerDefaultApps();

            if (window.HalDoModuleManager) {

                HalDoModuleManager.register(
                    "app-manager",
                    this
                );

            }

            console.log(
                "📱 HalDo App Manager gestartet"
            );

            return true;
        },


        registerApp(
            id,
            config = {}
        ) {

            if (!id) {
                return false;
            }

            this.apps[id] = {

                id: id,

                name:
                    config.name ||
                    id,

                page:
                    config.page ||
                    null,

                icon:
                    config.icon ||
                    "",

                description:
                    config.description ||
                    "",

                status:
                    "available"

            };

            return true;
        },


        registerDefaultApps() {

            this.registerApp(
                "dashboard",
                {
                    name: "Dashboard",
                    page: "dashboard.html",
                    icon: "📊"
                }
            );

            this.registerApp(
                "ai-core",
                {
                    name: "AI Core",
                    page: "ai-core.html",
                    icon: "🧠"
                }
            );

            this.registerApp(
                "modules",
                {
                    name: "Module",
                    page: "modules.html",
                    icon: "🧩"
                }
            );

            this.registerApp(
                "apps",
                {
                    name: "Apps",
                    page: "apps.html",
                    icon: "📱"
                }
            );

            this.registerApp(
                "settings",
                {
                    name: "Einstellungen",
                    page: "settings.html",
                    icon: "⚙️"
                }
            );

            this.registerApp(
                "status",
                {
                    name: "System Status",
                    page: "status.html",
                    icon: "📡"
                }
            );

            this.registerApp(
                "health",
                {
                    name: "Health Center",
                    page: "health.html",
                    icon: "🏥"
                }
            );

        },


        getApp(id) {

            return (
                this.apps[id] ||
                null
            );

        },


        getApps() {

            return Object.values(
                this.apps
            );

        },


        open(id) {

            const app =
                this.getApp(id);

            if (!app || !app.page) {
                return false;
            }

            window.location.href =
                app.page;

            return true;
        },


        getStatus() {

            return {

                status:
                    this.status,

                count:
                    Object.keys(
                        this.apps
                    ).length,

                apps:
                    this.apps

            };

        }

    };


    window.HalDoAppManager =
        HalDoAppManager;


    window.addEventListener(
        "DOMContentLoaded",
        function () {

            setTimeout(
                function () {

                    HalDoAppManager.init();

                },
                150
            );

        }
    );

})();