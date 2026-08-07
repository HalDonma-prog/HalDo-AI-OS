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


    version:
    "18.0.0",


    modules:
    [],



    initialize(){


        console.log(
            "🧩 Module Manager gestartet"
        );


        this.registerDefaultModules();


        this.startModules();


    },



    register(name, type){


        const module = {


            name:
            name,


            type:
            type,


            status:
            "registered"


        };



        this.modules.push(
            module
        );


        console.log(
            "📦 Modul registriert:",
            name
        );


    },



    registerDefaultModules(){


        this.register(
            "AI Foundation",
            "core"
        );


        this.register(
            "Security Foundation",
            "core"
        );


        this.register(
            "Database Foundation",
            "core"
        );


        this.register(
            "Update System",
            "system"
        );


    },



    startModules(){


        this.modules.forEach(
            module => {


                module.status =
                "active";


                console.log(
                    "🟢 Modul aktiv:",
                    module.name
                );


            }
        );



        this.updateScreen();


    },



    updateScreen(){


        const box =
        document.getElementById(
            "system-status"
        );



        if(box){


            box.innerHTML = `

            <h2>
            System Status
            </h2>


            <p>
            🟢 Module aktiv:
            ${this.modules.length}
            </p>


            <p>
            Version:
            ${this.version}
            </p>

            `;


        }


    },



    getModules(){


        return this.modules;


    }


};





// Module Manager starten

ModuleManager.initialize();