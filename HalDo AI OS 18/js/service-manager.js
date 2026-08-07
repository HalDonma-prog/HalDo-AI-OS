/*
========================================

HalDo AI OS 18
Service Manager Foundation

Version:
18.0.0

System Service Layer

========================================
*/


const ServiceManager = {


    name:
    "HalDo Service Manager",


    version:
    "18.0.0",


    status:
    "offline",


    services:
    [],



    initialize(){


        console.log(
            "⚙️ Service Manager Initialisierung..."
        );


        this.status =
        "starting";


        this.start();



    },



    start(){


        this.status =
        "active";



        if(
            typeof Logger !== "undefined"
        ){

            Logger.info(
                "Service Manager gestartet"
            );

        }



        if(
            typeof EventBus !== "undefined"
        ){

            EventBus.emit(
                "services.ready",
                {

                    status:
                    this.status

                }

            );

        }



        console.log(
            "⚙️ Service System bereit"
        );


    },



    register(service){


        if(
            !service.name
        ){

            console.error(
                "❌ Service benötigt Namen"
            );


            return false;

        }



        this.services.push(
            service
        );



        console.log(
            "⚙️ Service registriert:",
            service.name
        );



        if(
            typeof Logger !== "undefined"
        ){

            Logger.info(
                "Service registriert: "
                + service.name
            );

        }



        return true;


    },



    startService(name){


        const service =
        this.services.find(
            item =>
            item.name === name
        );



        if(
            !service
        ){

            console.warn(
                "🟡 Service nicht gefunden:",
                name
            );


            return false;

        }



        service.status =
        "active";



        console.log(
            "🟢 Service gestartet:",
            name
        );



        return true;


    },



    stopService(name){


        const service =
        this.services.find(
            item =>
            item.name === name
        );



        if(
            service
        ){

            service.status =
            "inactive";


            console.log(
                "🔵 Service gestoppt:",
                name
            );


        }


    },



    getServices(){


        return this.services;


    },



    getStatus(){


        return {


            name:
            this.name,


            version:
            this.version,


            status:
            this.status,


            services:
            this.services.length


        };


    }


};





// Service System starten

ServiceManager.initialize();