/*
========================================
HalDo AI OS Professional 16.0

Core Kernel System

========================================
*/

"use strict";


const HalDoKernel = {



    name: "HalDo AI OS Kernel",


    version: "16.0.0",


    status: "offline",


    modules: [],






    boot(){



        this.status = "online";





        if(window.HalDoLogger){


            HalDoLogger.success(

                "Kernel gestartet"

            );


        }




        if(window.HalDoEvents){


            HalDoEvents.emit(

                "kernel-ready",

                this.info()

            );


        }



        return true;



    },









    register(moduleName){



        if(

            !this.modules.includes(

                moduleName

            )

        ){



            this.modules.push(

                moduleName

            );




            if(window.HalDoLogger){


                HalDoLogger.info(

                    "Modul registriert: "

                    + moduleName

                );


            }



        }



    },









    remove(moduleName){



        this.modules =

        this.modules.filter(

            module =>

            module !== moduleName

        );


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

            this.modules



        };


    }





};





window.HalDoKernel = HalDoKernel;