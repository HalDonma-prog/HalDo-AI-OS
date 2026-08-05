/*
========================================
HalDo AI OS Professional 16.0

Module Manager

========================================
*/


"use strict";





const HalDoModules = {



    modules: {},







    register(name, module){



        if(

            !name ||

            !module

        ){


            return;


        }






        this.modules[name] = module;






        if(window.HalDoLogger){



            HalDoLogger.info(

                "Modul geladen: " + name

            );


        }






    },









    get(name){



        return this.modules[name] || null;



    },









    list(){



        return Object.keys(

            this.modules

        );



    },









    remove(name){



        delete this.modules[name];



    }






};







window.HalDoModules = HalDoModules;







// Grundmodule registrieren



document.addEventListener(

    "DOMContentLoaded",

    function(){



        if(window.HalDoModules){



            HalDoModules.register(

                "Core",

                {

                    version:

                    "16.0.0"

                }

            );



        }



    }

);