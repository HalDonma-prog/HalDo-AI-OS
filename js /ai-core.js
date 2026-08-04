/* =====================================
   HALDO AI OS
   AI CORE v2.1
   CLEAN INTELLIGENCE MODULE
===================================== */


/*
   HalDo AI Core
*/


const HalDoAICore = {


    name:

    "HalDo AI Core",



    version:

    "2.1",



    status:

    "online",



    memory: [],





    learn(text){


        this.memory.push(text);



        console.log(

            "🧠 AI gelernt:",

            text

        );


    },





    reply(message){


        const text =

        message.toLowerCase();




        if(
            text.includes("hallo") ||
            text.includes("hi")
        ){

            return "👋 Hallo! Ich bin HalDo AI.";

        }





        if(
            text.includes("wie geht es")
        ){

            return "💙 Mein System läuft stabil.";

        }





        if(
            text.includes("wer bist du")
        ){

            return "🤖 Ich bin der KI-Kern von HalDo AI OS.";

        }





        return (

            "🧠 Ich habe deine Nachricht erhalten: "

            + message

        );


    }

};





/*
   Global verbinden
*/


window.HalDoAICore =

HalDoAICore;





/*
   Verbindung mit System Manager
*/


if(window.HalDoSystem){


    HalDoSystem.registerModule(

        "AI Core",

        HalDoAICore

    );


}





console.log(

    "🤖 HalDo AI Core v2.1 READY"

);