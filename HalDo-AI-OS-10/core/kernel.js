/*
========================================
HalDo AI OS Professional 16.0
Ultimate Foundation

Core Kernel Engine
========================================
*/


"use strict";


const HalDoKernel = {


    name: "HalDo AI OS",


    version: "16.0.0",


    status: "created",


    modules: [],


    startTime: null,





    init(){


        this.status = "initialized";


        if(window.HalDoLogger){


            HalDoLogger.success(
                "Kernel initialisiert"
            );


        }


        console.log(
            "⚙️ Kernel bereit"
        );


    },





    register(moduleName){



        if(
            !this.modules.includes(moduleName)
        ){


            this.modules.push(moduleName);



            if(window.HalDoLogger){


                HalDoLogger.info(
                    "Modul registriert: "
                    + moduleName
                );


            }


        }


    },





    boot(){



        if(
            this.status === "running"
        ){


            console.warn(
                "Kernel läuft bereits"
            );


            return;


        }





        this.status = "running";


        this.startTime =
        new Date();




        if(window.HalDoLogger){


            HalDoLogger.success(
                "HalDo Kernel gestartet"
            );


        }





        console.log(
            "🚀 HalDo AI OS Kernel gestartet"
        );


        console.log(
            "📦 Module:",
            this.modules
        );


    },





    getStatus(){


        return this.status;


    },





    info(){



        return {


            name:
            this.name,


            version:
            this.version,


            status:
            this.status,


            modules:
            this.modules,


            startTime:
            this.startTime


        };


    }





};





window.HalDoKernel = HalDoKernel;