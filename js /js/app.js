// ==========================================
// HalDo AI OS Professional 10.0
// Main Application Controller
// ==========================================


"use strict";



const HalDoApp = {


    name: "HalDo AI OS",

    version: "10.0.0",

    status: "loading",



    start: function(){


        console.log(
            "🚀 HalDo AI OS startet..."
        );


        this.loadCore();


        this.status = "online";


        console.log(
            "✅ HalDo AI OS bereit"
        );


    },





    loadCore: function(){


        if(window.HalDoSystem){

            HalDoSystem.init();

        }



        if(window.HalDoEvents){

            HalDoEvents.init();

        }



        if(window.HalDoStorage){

            HalDoStorage.init();

        }



        console.log(
            "🧩 Core Module geladen"
        );


    }




};





window.addEventListener(

"DOMContentLoaded",

function(){


    HalDoApp.start();


});