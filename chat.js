/* =====================================
   HalDo AI OS v3.0
   CHAT SYSTEM v1.1 CONNECTED
===================================== */


/*
    HalDo Chat Modul

    Verbindung:
    Chat ↔ AI Core ↔ System Manager

    Vorbereitung:
    - KI Antworten
    - Memory
    - Sprache
    - spätere API Verbindung
*/






// ================================
// Verbindung prüfen
// ================================


if(window.HalDoAI){


    console.log(
        "🧠 Chat mit AI Core verbunden"
    );


}else{


    console.log(
        "⚠️ AI Core nicht gefunden"
    );


}






// ================================
// HalDo Chat Modul
// ================================


const HalDoChat = {



    name:
    "Chat",


    version:
    "1.1",


    messages: [],







    // Nachricht senden

    send(message){



        if(!message){


            console.log(
                "⚠️ Leere Nachricht"
            );


            return;


        }




        this.messages.push({


            user:
            message,


            time:
            new Date()


        });





        console.log(

            "💬 Nachricht:",

            message

        );





        return this.createResponse(
            message
        );



    },









    // Antwort erstellen

    createResponse(message){



        let response =

        "Ich bin HalDo AI. Wie kann ich helfen?";






        const text =

        message.toLowerCase();






        if(
            text.includes("hallo")
        ){


            response =

            "Hallo 💙 Ich bin HalDo AI OS.";


        }







        if(
            text.includes("name")
        ){


            response =

            "Mein Name ist HalDo AI.";


        }







        this.messages.push({


            ai:
            response,


            time:
            new Date()


        });







        // Memory Verbindung vorbereiten

        if(window.HalDoAI){


            HalDoAI.remember({

                type:
                "chat",


                message:
                message


            });


        }






        return response;



    }






};









// Global verfügbar machen


window.HalDoChat =
HalDoChat;









// Registrierung beim System Manager


if(window.HalDoSystem){



    HalDoSystem.registerModule(

        "Chat",

        HalDoChat

    );



    console.log(

        "⚙️ Chat beim System Manager registriert"

    );



}









console.log(

    "💬 HalDo Chat System bereit"

);