// ===============================
// HALDO AI OS v6.0 STABLE
// SCRIPT.JS
// ===============================



// Seiten wechseln

function openPage(pageId){

    const mainOS =
    document.getElementById("mainOS");


    if(mainOS){

        mainOS.classList.add("active");

    }


    const pages =
    document.querySelectorAll(".page");


    pages.forEach(page => {

        page.classList.add("hidden");

    });


    const activePage =
    document.getElementById(pageId);


    if(activePage){

        activePage.classList.remove("hidden");

    }

}


    const pages =
    document.querySelectorAll(".page");


    pages.forEach(page => {

        page.classList.add("hidden");

    });



    const activePage =
    document.getElementById(pageId);



    if(activePage){

        activePage.classList.remove("hidden");

    }

}





// Startseite laden

window.onload = function(){


    openPage("dashboard");


    updateSystemTime();


    setInterval(
        updateSystemTime,
        1000
    );


};





// Datum und Uhrzeit

function updateSystemTime(){


    const now =
    new Date();



    const date =
    now.toLocaleDateString(
        "de-DE"
    );



    const time =
    now.toLocaleTimeString(
        "de-DE"
    );



    const dateElement =
    document.getElementById(
        "systemDate"
    );


    const timeElement =
    document.getElementById(
        "systemTime"
    );



    if(dateElement){

        dateElement.innerHTML =
        "📅 " + date;

    }



    if(timeElement){

        timeElement.innerHTML =
        "🕒 " + time;

    }


}






// ===============================
// HALDO AI CHAT
// ===============================


function sendAIMessage(){


    const input =
    document.getElementById(
        "aiInput"
    );



    const history =
    document.getElementById(
        "chatHistory"
    );



    if(!input || !history){

        return;

    }



    const message =
    input.value.trim();



    if(message === ""){

        return;

    }



    history.innerHTML +=

    "<p>👤 Du: "
    + message
    + "</p>";



    history.innerHTML +=

    "<p>🤖 HalDo: Deine Anfrage wurde gespeichert. Die KI-Funktion wird weiter ausgebaut.</p>";



    input.value = "";



}
// ===============================
// HALDO NOTES
// ===============================


function saveNote(){


    const input =
    document.getElementById(
        "noteInput"
    );


    const list =
    document.getElementById(
        "noteList"
    );



    if(!input || !list){

        return;

    }



    const text =
    input.value.trim();



    if(text === ""){

        return;

    }



    const note =
    document.createElement(
        "p"
    );



    note.innerHTML =
    "📝 " + text;



    list.appendChild(note);



    input.value = "";

}





// ===============================
// EINSTELLUNGEN
// ===============================


function saveSettings(){


    const name =
    document.getElementById(
        "userName"
    );



    const message =
    document.getElementById(
        "settingsMessage"
    );



    if(name && name.value !== ""){


        localStorage.setItem(
            "haldoUser",
            name.value
        );



        const welcome =
        document.getElementById(
            "userWelcome"
        );



        if(welcome){

            welcome.innerHTML =
            "🌍 Willkommen "
            + name.value
            + " bei HalDo AI OS";

        }


    }



    if(message){

        message.innerHTML =
        "✅ Einstellungen gespeichert";

    }


}





// gespeicherten Benutzer laden


function loadUser(){


    const savedUser =
    localStorage.getItem(
        "haldoUser"
    );



    const welcome =
    document.getElementById(
        "userWelcome"
    );



    if(
        savedUser &&
        welcome
    ){


        welcome.innerHTML =
        "🌍 Willkommen "
        + savedUser
        + " bei HalDo AI OS";


    }


}



window.addEventListener(
    "load",
    loadUser
);
// ===============================
// PDF CREATOR VORBEREITUNG
// ===============================


function createPDF(){


    const text =
    document.getElementById(
        "pdfText"
    );



    if(!text){

        return;

    }



    if(text.value.trim() === ""){


        alert(
            "Bitte zuerst Text eingeben."
        );


        return;

    }



    alert(
        "📄 PDF Vorbereitung erfolgreich!"
    );


}





// ===============================
// DARK MODE VORBEREITUNG
// ===============================


function toggleDarkMode(){


    document.body.classList.toggle(
        "dark"
    );


}






// ===============================
// SYSTEM START
// ===============================


console.log(
    "🌍 HalDo AI OS v6.0 Stable gestartet"
);
// ===============================
// HALDO SPRACHE SPEICHERN
// ===============================

function saveLanguage(){

    const language =
    document.getElementById(
        "language"
    );


    if(language){

        localStorage.setItem(
            "haldoLanguage",
            language.value
        );

        console.log(
            "🌍 Sprache gespeichert:",
            language.value
        );

    }

}
// ===============================
// HALDO AI OS v7.0
// SPLASH SCREEN START
// ===============================


window.addEventListener(
    "load",
    function(){

        const splash =
        document.getElementById(
            "splashScreen"
        );


        if(splash){

            setTimeout(
                function(){

                    splash.style.opacity = "0";


                    setTimeout(
                        function(){

                            splash.style.display = "none";


const mainOS =
document.getElementById("mainOS");


if(mainOS){

    mainOS.classList.add("active");

}