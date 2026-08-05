/*
========================================
HalDo AI OS Professional 10.0
Application Bootloader
Foundation Build
========================================
*/

"use strict";


const HalDoApp = {


    version: "10.0.0",


    start(){


        console.log(
            "🚀 HalDo AI OS Boot startet..."
        );


        this.checkCore();


    },



    checkCore(){


        const requiredModules = [


            "HalDoKernel",
            "HalDoEvents",
            "HalDoStorage",
            "HalDoRouter",
            "HalDoSystem"


        ];



        const missing = requiredModules.filter(

            module => !window[module]

        );



        if(missing.length > 0){


            console.error(

                "❌ Fehlende Module:",

                missing

            );


            return false;


        }



        console.log(

            "✅ Alle Core-Module geladen"

        );



        this.launch();


    },





    launch(){



        HalDoSystem.start();



        console.log(

            "🤖 HalDo AI OS 10.0 läuft"

        );


    }



};





window.HalDoApp = HalDoApp;



window.addEventListener(

    "DOMContentLoaded",

    () => {


        HalDoApp.start();


    }

);