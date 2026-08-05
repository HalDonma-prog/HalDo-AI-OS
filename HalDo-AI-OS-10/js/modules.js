/*
========================================
HalDo AI OS Professional 16.0

Module Manager

========================================
*/

"use strict";


const HalDoModules = {



    modules: [],






    register(name, version = "1.0.0"){



        const module = {


            name: name,


            version: version,


            status: "active"



        };






        this.modules.push(

            module

        );






        if(window.HalDoLogger){



            HalDoLogger.info(

                "Modul geladen: " + name

            );


        }







        return module;



    },









    remove(name){



        this.modules =

        this.modules.filter(

            module =>

            module.name !== name

        );



    },









    get(name){



        return this.modules.find(

            module =>

            module.name === name

        );



    },









    all(){



        return this.modules;



    },









    init(){



        console.log(

            "🧩 Modul-System gestartet"

        );







        this.register(

            "Dashboard",

            "16.0"

        );



        this.register(

            "AI Chat",

            "16.0"

        );



        this.register(

            "Settings",

            "16.0"

        );



    }





};





window.HalDoModules = HalDoModules;







document.addEventListener(

    "DOMContentLoaded",

    () => {



        HalDoModules.init();



    }

);