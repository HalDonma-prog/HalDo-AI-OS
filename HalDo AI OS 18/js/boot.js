/*
====================================

HalDo AI OS 18
Boot Manager

====================================
*/


const HalDoBoot = {


    version:
    "18.0.0",


    status:
    "starting",



    initialize(){


        console.log(
        "HalDo AI OS Boot gestartet"
        );


        this.checkSystem();


    },



    checkSystem(){


        console.log(
        "Systemprüfung..."
        );


        this.status =
        "ready";


    }



};



window.HalDoBoot =
HalDoBoot;



window.addEventListener(
"load",
()=>{

    HalDoBoot.initialize();

});