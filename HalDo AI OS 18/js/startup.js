/*
====================================

HalDo AI OS 18
Startup System

Version:
18.0.0

====================================
*/


function startHalDoOS() {


    const startup = document.getElementById(
        "startup-screen"
    );


    const logo =
    document.getElementById(
        "system-logo"
    );


    const message =
    document.getElementById(
        "startup-message"
    );



    if(!startup) return;



    // Logo anzeigen

    logo.style.opacity = "1";



    setTimeout(() => {


        message.innerHTML =
        "🟡 HalDo AI OS wird gestartet...";


    },1000);




    setTimeout(() => {


        message.innerHTML =
        "🔵 Systemmodule werden geladen...";


    },2500);





    setTimeout(() => {


        message.innerHTML =
        "🟢 System bereit";


    },4000);





    setTimeout(() => {


        showWelcome();


    },5500);



}




function showWelcome(){


    const welcome =
    document.getElementById(
        "welcome-screen"
    );


    const startup =
    document.getElementById(
        "startup-screen"
    );



    if(startup){

        startup.style.display =
        "none";

    }



    if(welcome){

        welcome.style.display =
        "flex";

    }

}






window.addEventListener(
"load",
startHalDoOS
);