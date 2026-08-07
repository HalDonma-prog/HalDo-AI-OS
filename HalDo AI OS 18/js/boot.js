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


    version:
    "18.0.0",


    system:
    "HalDo AI OS",


    status:
    "starting",




    updateStatus(text){


        const status =
        document.getElementById(
            "status"
        );



        if(status){


            status.innerHTML =
            text;


        }


    },






    start(){


        console.log(
        "🟡 HalDo AI OS 18 Bootloader gestartet"
        );



        this.status =
        "booting";



        this.updateStatus(
        "🟡 System wird vorbereitet..."
        );



        setTimeout(()=>{


            this.updateStatus(
            "🔵 Kernel wird geladen..."
            );



        },1000);






        setTimeout(()=>{


            this.updateStatus(
            "🔵 Module werden geprüft..."
            );



        },2500);







        setTimeout(()=>{


            this.status =
            "ready";



            this.updateStatus(
            "🟢 System bereit"
            );



        },4000);



    }




};





window.HalDoBoot =
HalDoBoot;




window.addEventListener(
"load",
()=>{


    HalDoBoot.start();


});