/*
========================================

HalDo AI OS 18
Module Manager Foundation

Version:
18.0.0

Module Management Layer

========================================
*/


const ModuleManager = {


    name:
    "HalDo Module Manager",


    version:
    "18.0.0",


    status:
    "offline",


    modules:
    [],



    initialize(){


        console.log(
            "🧩 Module Manager Initialisierung..."
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
                "Module Manager gestartet"
            );


        }



        if(
            typeof EventBus !== "undefined"
        ){

            EventBus.emit(
                "modules.ready",
                {

                    status:
                    this.status


                }

            );


        }



        console.log(
            "🧩 Module System bereit"
        );


    },



    register(module){


        if(
            !module.name
        ){


            console.error(
                "❌ Modul ohne Namen"
            );


            return false;


        }



        this.modules.push(
            module
        );



        console.log(
            "🧩 Modul registriert:",
            module.name
        );



        if(
            typeof Logger !== "undefined"
        ){

            Logger.info(
                "Modul registriert: "
                + module.name
            );

        }



        return true;


    },



    load(name){


        const module =
        this.modules.find(
            item =>
            item.name === name
        );



        if(
            !module
        ){


            console.warn(
                "🟡 Modul nicht gefunden:",
                name
            );


            return false;


        }



        module.status =
        "active";



        console.log(
            "🟢 Modul geladen:",
            name
        );



        return true;


    },



    unload(name){


        const module =
        this.modules.find(
            item =>
            item.name === name
        );



        if(
            module
        ){

            module.status =
            "inactive";


            console.log(
                "🔵 Modul deaktiviert:",
                name
            );


        }


    },



    getModules(){


        return this.modules;


    },



    getStatus(){


        return {


            name:
            this.name,


            version:
            this.version,


            status:
            this.status,


            modules:
            this.modules.length


        };


    }


};





// Module System starten

ModuleManager.initialize();