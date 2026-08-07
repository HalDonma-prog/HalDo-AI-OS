/*
====================================

HalDo AI OS 18
Boot Manager

Professional Ultimate Foundation

Version:
18.0.0

====================================
*/


const HalDoBoot = {


    version: "18.0.0",


    status: "starting",



    setStatus(message){


        const element =
        document.getElementById(
            "system-status"
        );


        if(element){

            element.innerHTML =
            message;

        }


    },





    start(){


        console.log(
        "🟡 HalDo AI OS 18 Boot gestartet"
        );



        this.status =
        "booting";



        this.setStatus(
        "🟡 HalDo AI OS wird gestartet..."
        );





        setTimeout(()=>{


            this.setStatus(
            "🔵 Kernel wird geladen..."
            );



        },1500);







        setTimeout(()=>{


            this.setStatus(
            "🔵 Systemmodule werden geprüft..."
            );



        },3000);







        setTimeout(()=>{


            this.status =
            "ready";



            this.setStatus(
            "🟢 System bereit"
            );



        },4500);




    }



};







window.HalDoBoot =
HalDoBoot;







window.addEventListener(
"load",
()=>{


    HalDoBoot.start();


});