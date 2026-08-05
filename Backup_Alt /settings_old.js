/* ==========================================
   HalDo AI OS 1.0
   Settings Controller
========================================== */


/*
   Einstellungen Start
*/

document.addEventListener(
    "DOMContentLoaded",
    function(){

        console.log(
            "⚙️ Einstellungen geladen"
        );

    }
);



/*
   Design Funktion
*/

function changeTheme(){

    const message =
    document.getElementById(
        "message"
    );


    message.innerHTML =
    "🌙 Dunkles HalDo AI Design ist aktiv.";

}



/*
   System Information
*/

function systemInfo(){

    const message =
    document.getElementById(
        "message"
    );


    message.innerHTML =
    `
    🤖 HalDo AI OS<br>
    Version: 1.0<br>
    Status: Online
    `;

}



/*
   Memory Status
*/

function memoryInfo(){

    const message =
    document.getElementById(
        "message"
    );


    message.innerHTML =
    `
    🧠 Memory System<br>
    Status: Vorbereitung aktiv
    `;

}