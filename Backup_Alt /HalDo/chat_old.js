/* ==========================================
   HalDo AI OS 1.0
   Chat Controller
========================================== */


/*
   Chat starten
*/

document.addEventListener(
    "DOMContentLoaded",
    function(){

        console.log(
            "🤖 HalDo AI Chat geladen"
        );

    }
);



/*
   Nachricht senden
*/

function sendMessage(){


    const input =
    document.getElementById(
        "userInput"
    );


    const chatBox =
    document.getElementById(
        "chatBox"
    );


    const message =
    input.value.trim();



    if(message === ""){

        return;

    }



    // Benutzer Nachricht

    const userMessage =
    document.createElement(
        "div"
    );


    userMessage.className =
    "message user";


    userMessage.innerHTML =
    message;


    chatBox.appendChild(
        userMessage
    );



    input.value = "";



    // KI Antwort

    setTimeout(

        function(){


            const aiMessage =
            document.createElement(
                "div"
            );


            aiMessage.className =
            "message ai";


            aiMessage.innerHTML =
            getAIResponse(
                message
            );


            chatBox.appendChild(
                aiMessage
            );


            chatBox.scrollTop =
            chatBox.scrollHeight;


        },

        700

    );


}



/*
   Einfaches KI Antwort-System
*/

function getAIResponse(message){


    message =
    message.toLowerCase();



    if(
        message.includes("hallo")
        ||
        message.includes("hi")
    ){

        return "👋 Hallo! Ich bin HalDo AI. Schön, dass du da bist.";

    }



    if(
        message.includes("name")
    ){

        return "🤖 Ich bin HalDo AI OS Version 1.0.";

    }



    if(
        message.includes("hilfe")
    ){

        return "⚙️ Ich werde Schritt für Schritt mit neuen Funktionen erweitert.";

    }



    return "🧠 Ich habe deine Nachricht erhalten. Mein KI-System wird weiter ausgebaut.";

}