// ==========================================
// HalDo AI OS Professional 10.0
// Main Application Controller
// Foundation Build 001
// ==========================================


"use strict";



const HalDoApp = {



    name: "HalDo AI OS",


    version: "10.0.0",


    status: "starting",





    start: function(){


        console.log(
            "🚀 HalDo AI OS startet..."
        );



        this.initializeCore();



        this.status = "online";



        console.log(
            "✅ HalDo AI OS ist online"
        );


    },







    initializeCore: function(){



        if(window.HalDoEvents){


            HalDoEvents.init();


        }




        if(window.HalDoStorage){


            HalDoStorage.init();


        }




        if(window.HalDoRouter){


            HalDoRouter.init();


        }




        if(window.HalDoSystem){


            HalDoSystem.init();


        }




        console.log(
            "🧩 Alle Core Module bereit"
        );



    }





};






window.HalDoApp = HalDoApp;





window.addEventListener(

"DOMContentLoaded",

function(){


    HalDoApp.start();


}

);