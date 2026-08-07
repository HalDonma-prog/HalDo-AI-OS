/*
========================================

HalDo AI OS 18
App Manager

Version:
18.0.0

Application Management System

========================================
*/


const AppManager = {


    name:
    "HalDo App Manager",


    version:
    "18.0.0",


    status:
    "offline",



    apps:
    [],



    initialize(){


        console.log(
            "📱 App Manager startet..."
        );


        this.status =
        "starting";


        this.loadDefaultApps();


    },



    loadDefaultApps(){


        this.apps = [


            {

                name:
                "Dashboard",

                version:
                "18.0.0",

                status:
                "active"


            },


            {

                name:
                "AI Chat",

                version:
                "1.0.0",

                status:
                "ready"


            }


        ];



        this.status =
        "ready";



        console.log(
            "📱 Apps geladen:",
            this.apps
        );


    },



    installApp(app){


        this.apps.push(
            app
        );



        console.log(
            "📲 App installiert:",
            app.name
        );


    },



    removeApp(name){


        this.apps =
        this.apps.filter(

            app =>
            app.name !== name

        );



        console.log(
            "🗑️ App entfernt:",
            name
        );


    },



    startApp(name){


        const app =
        this.getApp(name);



        if(app){


            app.status =
            "active";



            console.log(
                "🟢 App gestartet:",
                name
            );


        }


    },



    stopApp(name){


        const app =
        this.getApp(name);



        if(app){


            app.status =
            "stopped";


            console.log(
                "🔴 App gestoppt:",
                name
            );


        }


    },



    getApp(name){


        return this.apps.find(

            app =>
            app.name === name

        );


    },



    getApps(){


        return this.apps;


    },



    getStatus(){


        return {


            name:
            this.name,


            version:
            this.version,


            status:
            this.status,


            apps:
            this.apps.length


        };


    }


};





AppManager.initialize();



console.log(
    "📱 HalDo App Manager geladen"
);