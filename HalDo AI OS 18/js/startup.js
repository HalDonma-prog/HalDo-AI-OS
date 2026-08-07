 /*
====================================

HalDo AI OS 18
Startup System

Professional Ultimate Foundation

Version:
18.0.0

====================================
*/


function setSystemMessage(text){


    const status =
    document.getElementById(
        "system-status"
    );


    if(status){

        status.innerHTML = text;

    }


}







function showWelcome(){


    const startup =
    document.getElementById(
        "startup-screen"
    );



    const welcome =
    document.getElementById(
        "welcome-screen"
    );



    if(startup){

        startup.style.display =
        "none";

    }



    if(welcome){

        welcome.classList.remove(
            "hidden"
        );

    }



}








function startHalDoOS(){



    console.log(
    "🚀 HalDo AI OS 18 gestartet"
    );



    setSystemMessage(
    "🟡 HalDo AI OS startet..."
    );





    setTimeout(()=>{


        setSystemMessage(
        "🔵 Kernel wird geladen..."
        );


    },1500);








    setTimeout(()=>{


        setSystemMessage(
        "🔵 Systemmodule werden geladen..."
        );


    },3000);








    setTimeout(()=>{


        setSystemMessage(
        "🔵 AI Core wird vorbereitet..."
        );


    },4500);








    setTimeout(()=>{


        setSystemMessage(
        "🟢 System bereit"
        );


    },6000);








    setTimeout(()=>{


        showWelcome();


    },7500);



}







window.addEventListener(

"load",

startHalDoOS

);