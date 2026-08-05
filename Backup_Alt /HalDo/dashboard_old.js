/* ==========================================
   HalDo AI OS 1.0
   Dashboard Controller
========================================== */


/*
   Dashboard Start
*/

document.addEventListener(
    "DOMContentLoaded",
    function(){

        console.log(
            "🖥️ Dashboard geladen"
        );


        loadDashboard();

    }
);



/*
   Dashboard Daten laden
*/

function loadDashboard(){

    const dashboardInfo = {

        system:
        "HalDo AI OS",

        version:
        "1.0",

        status:
        "Online"

    };


    console.log(
        dashboardInfo
    );

}



/*
   Chat öffnen
*/

function openChat(){

    window.location.href =
    "chat.html";

}



/*
   System Nachricht
*/

function showSystemMessage(message){

    console.log(
        "HalDo AI:",
        message
    );

}


/*
   Test

*/

showSystemMessage(
    "Dashboard bereit 🚀"
);