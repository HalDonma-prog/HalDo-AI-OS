/*
========================================
HalDo AI OS Professional 16.0

Application Controller

========================================
*/

"use strict";


const HalDoApp = {



    version: "16.0.0",


    started: false,






    start(){



        if(this.started){


            return;


        }




        console.log(

            "🚀 HalDo AI OS Application Start"

        );






        if(window.HalDoSystem){


            HalDoSystem.init();


        }





        this.started = true;



    },






    info(){


        return {


            name: "HalDo AI OS",

            version: this.version,

            running: this.started


        };


    }




};





window.HalDoApp = HalDoApp;





document.addEventListener(

    "DOMContentLoaded",

    () => {


        HalDoApp.start();


    }

);