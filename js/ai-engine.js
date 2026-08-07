/*
=====================================

HalDo AI OS 18
AI Engine

Command Integration

Version 18.0.0

=====================================
*/


const HalDoAI = {


    version:"18.0.0",


    name:"HalDo AI",


    status:"ready",


    language:"de",



    memory:[],






    start(){


        this.status="running";


        console.log(

        "🤖 HalDo AI Engine gestartet"

        );


    },







    setLanguage(lang){


        this.language = lang;



        console.log(

        "🌍 Sprache:",

        lang

        );


    },







    answer(message){



        if(!message){


            return "";

        }






        // Erst Befehle prüfen

        if(window.HalDoCommands){



            const command =

            HalDoCommands.execute(

                message

            );



            if(command){


                return command;


            }


        }







        const text =

        message.toLowerCase();







        if(
            text.includes("hallo")
        ){


            return (

            "👋 Hallo! Ich bin HalDo AI. "

            +

            "Wie kann ich dir helfen?"

            );


        }







        if(
            text.includes("wie geht")
        ){


            return (

            "😊 Mir geht es gut. "

            +

            "Ich bin bereit zu helfen."

            );


        }







        if(
            text.includes("uhr")
        ){


            return (

            "🕒 "

            +

            new Date()

            .toLocaleTimeString(

                "de-DE"

            )

            );


        }







        if(
            text.includes("datum")
        ){


            return (

            "📅 "

            +

            new Date()

            .toLocaleDateString(

                "de-DE"

            )

            );


        }








        return (

        "🤖 Ich habe dich verstanden: "

        +

        message

        );



    }





};







window.HalDoAI =
HalDoAI;







window.addEventListener(

"load",

()=>{


HalDoAI.start();



});