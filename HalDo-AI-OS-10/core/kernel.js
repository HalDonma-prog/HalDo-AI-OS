/*
========================================
HalDo AI OS Professional 10.0
Kernel Core
Foundation Build
========================================
*/


"use strict";



const HalDoKernel = {


    name: "HalDo AI OS",

    version: "10.0.0",

    status: "created",

    modules: [],

    startTime: null,




    register(moduleName){


        if(!this.modules.includes(moduleName)){


            this.modules.push(moduleName);


            console.log(
                "🔧 Modul registriert:",
                moduleName
            );


        }


    },





    boot(){


        if(this.status === "running"){

            console.warn(
                "⚠️ Kernel läuft bereits"
            );

            return;

        }



        this.status = "running";


        this.startTime = new Date();



        console.log(
            "🚀 HalDo Kernel gestartet"
        );


        console.log(
            "📦 Aktive Module:",
            this.modules
        );


    },





    getStatus(){


        return this.status;


    },





    info(){


        return {


            name: this.name,

            version: this.version,

            status: this.status,

            modules: this.modules,

            started:
            this.startTime


        };


    }





};





window.HalDoKernel = HalDoKernel;