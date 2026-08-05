/*
========================================
HalDo AI OS Professional Ultimate 16.0

Core Kernel System

========================================
*/


"use strict";


const HalDoKernel = {


    modules: [],


    status: "offline",







    init(){


        this.status = "online";



        console.log(

            "⚙️ HalDo Kernel gestartet"

        );





        if(window.HalDoLogger){


            HalDoLogger.success(

                "Kernel erfolgreich initialisiert"

            );


        }



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



            console.log(

                "📦 Modul registriert:",

                moduleName

            );



        }



    },









    remove(moduleName){



        this.modules =

        this.modules.filter(

            item => item !== moduleName

        );



    },









    getModules(){



        return this.modules;



    },









    info(){



        return {



            status:

            this.status,



            modules:

            this.modules



        };



    }






};






window.HalDoKernel = HalDoKernel;