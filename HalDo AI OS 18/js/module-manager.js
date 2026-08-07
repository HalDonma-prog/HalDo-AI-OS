/*
========================================

HalDo AI OS 18
Module Manager

Version:
18.0.0

Module Control System

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
            "🧩 Module Manager startet..."
        );


        this.status =
        "starting";


        this.updateStatus(
            "🔵 Module werden geladen..."
        );


        this.loadDefaultModules();


    },



    loadDefaultModules(){


        this.modules = [


            {

                name:
                "AI Core",

                status:
                "ready"

            },


            {

                name:
                "Security",

                status:
                "ready"

            },


            {

                name:
                "Database",

                status:
                "ready"

            }


        ];



        console.log(
            "🧩 Module geladen:",
            this.modules
        );



        this.status =
        "ready";



        this.updateStatus(
            "🟢 Module geladen"
        );



    },



    registerModule(module){


        this.modules.push(
            module
        );



        console.log(
            "➕ Neues Modul:",
            module
        );


    },



    removeModule(name){


        this.modules =
        this.modules.filter(
            module =>
            module.name !== name
        );



        console.log(
            "🗑️ Modul entfernt:",
            name
        );


    },



    getModules(){


        return this.modules;


    },



    getModule(name){


        return this.modules.find(

            module =>
            module.name === name

        );


    },



    startModule(name){


        const module =
        this.getModule(name);



        if(module){


            module.status =
            "active";



            console.log(
                "🟢 Modul gestartet:",
                name
            );


        }



    },



    stopModule(name){


        const module =
        this.getModule(name);



        if(module){


            module.status =
            "stopped";



            console.log(
                "🔴 Modul gestoppt:",
                name
            );


        }



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


            modules:
            this.modules


        };


    }


};





console.log(
    "🧩 HalDo Module Manager geladen"
);