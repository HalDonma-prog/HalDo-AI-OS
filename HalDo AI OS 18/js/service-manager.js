/*
========================================

HalDo AI OS 18
Service Manager

Version:
18.0.0

System Service Control

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
            "⚙️ Service Manager startet..."
        );


        this.status =
        "starting";


        this.updateStatus(
            "🔵 Systemdienste werden geladen..."
        );


        this.loadDefaultServices();


    },



    loadDefaultServices(){


        this.services = [


            {

                name:
                "Status Service",

                status:
                "active"

            },


            {

                name:
                "Update Service",

                status:
                "ready"

            },


            {

                name:
                "Database Service",

                status:
                "ready"

            },


            {

                name:
                "Security Service",

                status:
                "ready"

            }


        ];



        console.log(
            "⚙️ Dienste geladen:",
            this.services
        );



        this.status =
        "ready";



        this.updateStatus(
            "🟢 Systemdienste bereit"
        );



    },



    registerService(service){


        this.services.push(
            service
        );



        console.log(
            "➕ Dienst registriert:",
            service
        );


    },



    startService(name){


        const service =
        this.getService(name);



        if(service){


            service.status =
            "active";



            console.log(
                "🟢 Dienst gestartet:",
                name
            );


        }


    },



    stopService(name){


        const service =
        this.getService(name);



        if(service){


            service.status =
            "stopped";



            console.log(
                "🔴 Dienst gestoppt:",
                name
            );


        }


    },



    getService(name){


        return this.services.find(

            service =>
            service.name === name

        );


    },



    getServices(){


        return this.services;


    },



    updateStatus(message){


        const element =
        document.getElementById(
            "system-status"
        );



        if(element){


            element.innerHTML =
            message;


        }



        console.log(
            message
        );


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
            this.services


        };


    }


};





console.log(
    "⚙️ HalDo Service Manager geladen"
);