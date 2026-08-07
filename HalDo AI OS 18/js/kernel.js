/*
========================================

HalDo AI OS 18
Kernel Foundation

Version:
18.0.0

System Core Controller

========================================
*/


const Kernel = {


    name:
    "HalDo Kernel",


    version:
    "18.0.0",


    status:
    "offline",


    components:
    {},



    initialize(){


        console.log(
            "🧠 Kernel Initialisierung..."
        );


        this.status =
        "starting";


        this.registerCoreComponents();


        this.start();



    },



    registerCoreComponents(){


        this.components = {


            eventBus:
            typeof EventBus !== "undefined",


            logger:
            typeof Logger !== "undefined",


            config:
            typeof ConfigManager !== "undefined"


        };



        console.log(
            "🧩 Kernel Komponenten:",
            this.components
        );



    },



    start(){


        this.status =
        "active";



        if(
            typeof Logger !== "undefined"
        ){

            Logger.info(
                "Kernel erfolgreich gestartet"
            );


        }



        if(
            typeof EventBus !== "undefined"
        ){

            EventBus.emit(
                "kernel.ready",
                {

                    version:
                    this.version

                }

            );


        }



        console.log(
            "🧠 HalDo AI OS 18 Kernel aktiv"
        );



    },



    registerComponent(
        name,
        component
    ){


        this.components[name]
        =
        component;



        console.log(
            "🧩 Komponente registriert:",
            name
        );


    },



    getComponent(name){


        return this.components[name];


    },



    getStatus(){


        return {


            name:
            this.name,


            version:
            this.version,


            status:
            this.status,


            components:
            this.components


        };


    }


};





// Kernel starten

Kernel.initialize();