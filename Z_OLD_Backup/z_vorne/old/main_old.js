/* ==========================================
   HalDo AI OS 1.0
   Main Application Controller
========================================== */


/*
   System Start
*/

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "🤖 HalDo AI OS gestartet"
        );

        initializeSystem();

    }
);



/*
   Hauptsystem Initialisierung
*/

function initializeSystem(){

    console.log(
        "⚙️ System Module werden geladen..."
    );


    loadConfiguration();


}



/*
   Konfiguration laden
*/

function loadConfiguration(){

    const system = {

        name: "HalDo AI OS",

        version: "1.0",

        status: "online"

    };


    console.log(
        system
    );


}



/*
   Dashboard öffnen
*/

function openDashboard(){

    window.location.href =
    "dashboard.html";

}



/*
   Navigation Funktion
*/

function navigate(page){

    window.location.href =
    page;

}



/*
   Einfacher System Status
*/

function getSystemStatus(){

    return {

        system:
        "HalDo AI OS",

        version:
        "1.0",

        running:
        true

    };

}


/*
   Test Ausgabe
*/

console.log(
    "🚀 HalDo AI OS Core bereit"
);