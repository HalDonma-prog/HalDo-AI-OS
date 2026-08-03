/* =====================================
   HALDO AI OS 6.0 STABLE
   MAIN SYSTEM SCRIPT
===================================== */


/* SYSTEM START */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        console.log(
            "💙 HalDo AI OS 6.0 Stable gestartet"
        );


        startBoot();


        updateClock();


        setInterval(
            updateClock,
            1000
        );


        loadSavedNote();

    }
);



/* =====================================
   BOOT SYSTEM
===================================== */


function startBoot(){

    const boot =
    document.getElementById(
        "boot-screen"
    );


    const app =
    document.getElementById(
        "app"
    );


    setTimeout(
        () => {


            if(boot){

                boot.style.display =
                "none";

            }


            if(app){

                app.classList.remove(
                    "hidden"
                );

            }


        },
        2000
    );

}




/* =====================================
   NAVIGATION SYSTEM
===================================== */


function showPage(page){


    const pages =
    document.querySelectorAll(
        ".page"
    );


    pages.forEach(
        p => {

            p.classList.add(
                "hidden"
            );

        }
    );


    const active =
    document.getElementById(
        page
    );


    if(active){

        active.classList.remove(
            "hidden"
        );

    }


}


window.showPage =
showPage;






/* =====================================
   CLOCK SYSTEM
===================================== */


function updateClock(){


    const now =
    new Date();



    const date =
    document.getElementById(
        "date"
    );


    const time =
    document.getElementById(
        "time"
    );



    if(date){

        date.innerHTML =
        "📅 " +
        now.toLocaleDateString(
            "de-DE"
        );

    }



    if(time){

        time.innerHTML =
        "🕒 " +
        now.toLocaleTimeString(
            "de-DE"
        );

    }


}







/* =====================================
   HALDO AI CORE 🤖
===================================== */


function sendMessage(){


    const input =
    document.getElementById(
        "aiInput"
    );


    const output =
    document.getElementById(
        "aiOutput"
    );


    if(
        !input ||
        !output
    ){

        return;

    }



    let message =
    input.value
    .toLowerCase()
    .trim();



    let answer =
    "💙 Ich habe deine Nachricht erhalten.";



    if(
        message.includes(
            "hallo"
        )
    ){

        answer =
        "🤖 Hallo! Ich bin HalDo AI v6.0.";

    }



    else if(
        message.includes(
            "wer bist du"
        )
    ){

        answer =
        "🌍 Ich bin HalDo AI OS 6.0, dein intelligentes System.";

    }



    else if(
        message.includes(
            "hilfe"
        )
    ){

        answer =
        "🚀 Ich unterstütze dich bei KI, Schreiben, Notizen und Systemfunktionen.";

    }



    output.innerHTML =
    answer;



    input.value="";


}


window.sendMessage =
sendMessage;








/* =====================================
   NOTES SYSTEM 📝
===================================== */


function saveNote(){


    const input =
    document.getElementById(
        "noteInput"
    );


    const output =
    document.getElementById(
        "noteOutput"
    );



    if(!input){

        return;

    }



    localStorage.setItem(
        "haldo_note",
        input.value
    );



    if(output){

        output.innerHTML =
        "✅ Notiz gespeichert";

    }


}



function loadSavedNote(){


    const input =
    document.getElementById(
        "noteInput"
    );


    const saved =
    localStorage.getItem(
        "haldo_note"
    );



    if(
        input &&
        saved
    ){

        input.value =
        saved;

    }


}


window.saveNote =
saveNote;






/* =====================================
   SYSTEM INFO
===================================== */


window.HalDoSystem = {


    name:
    "HalDo AI OS",


    version:
    "6.0 Stable",


    status:
    "ONLINE",



    getStatus(){

        return {

            system:
            this.name,

            version:
            this.version,

            status:
            this.status

        };

    }


};



console.log(
"🚀 HalDo AI OS 6.0 CORE READY"
);
