/* =====================================
   HalDo AI OS v3.0
   DASHBOARD CONTROL v1.1
===================================== */


/*
    Dashboard Steuerung

    Aufgaben:
    - Navigation
    - Modul Öffnung
    - System Status
    - Verbindung mit AI Core
*/






// =====================================
// CHAT ÖFFNEN
// =====================================


function openChat(){


    window.location.href =
    "chat.html";


}








// =====================================
// FILES ÖFFNEN
// =====================================


function openFiles(){


    window.location.href =
    "files.html";


}








// =====================================
// MODULE ÖFFNEN
// =====================================


function openModule(page){



    if(page){


        window.location.href =
        page;


    }else{


        console.log(
            "⚠️ Kein Modul angegeben"
        );


    }



}









// =====================================
// DASHBOARD START
// =====================================


document.addEventListener(

    "DOMContentLoaded",

    ()=>{


        console.log(
            "💙 HalDo Dashboard gestartet"
        );



        loadSystemStatus();



        connectCore();



    }

);









// =====================================
// SYSTEM STATUS
// =====================================


function loadSystemStatus(){



    const status =

    document.querySelector(
        ".status span"
    );



    if(status){


        status.innerHTML =
        "🟢 HalDo AI Online";


    }



}









// =====================================
// AI CORE VERBINDUNG
// =====================================


function connectCore(){



    if(window.HalDoAI){



        console.log(
            "🧠 Dashboard mit AI Core verbunden"
        );



    }else{



        console.log(
            "⚠️ AI Core nicht verfügbar"
        );



    }




    if(window.HalDoSystem){



        HalDoSystem.registerModule(

            "Dashboard",

            {

                status:
                "online"

            }

        );



        console.log(
            "⚙️ Dashboard beim System Manager registriert"
        );



    }



}