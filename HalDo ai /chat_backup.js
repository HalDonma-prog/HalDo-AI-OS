/* =====================================
   HalDo AI OS
   CHAT SYSTEM v3.0 FOUNDATION
===================================== */


/*
    Verbindung:
    Chat ↔ HalDo AI Core

    Vorbereitung für:
    - KI Antworten
    - Sprache
    - Memory
    - spätere API Verbindung
*/



// Prüfen ob AI Core vorhanden ist

if(window.HalDoAI){

    console.log(
        "🤖 HalDo AI Core verbunden"
    );

}else{

    console.log(
        "⚠️ AI Core nicht gefunden"
    );

}




// ================================
// Chat Nachrichten Speicher
// ================================


const HalDoChat = {


    messages: [],



    send(message){


        this.messages.push({

            user: message,

            time: new Date()

        });



        console.log(
            "💬 Nachricht:",
            message
        );


        return this.createResponse(message);


    },




    createResponse(message){


        let response =
        "Ich bin HalDo AI. Wie kann ich helfen?";



        if(
            message.toLowerCase()
            .includes("hallo")
        ){

            response =
            "Hallo 💙 Ich bin HalDo AI OS.";

        }



        if(
            message.toLowerCase()
            .includes("name")
        ){

            response =
            "Mein Name ist HalDo AI.";

        }



        this.messages.push({

            ai: response,

            time: new Date()

        });



        return response;


    }


};




// Global verfügbar

window.HalDoChat = HalDoChat;



console.log(
    "💬 HalDo Chat System bereit"
);