/*
=====================================

HalDo AI OS 18
AI Chat System

Professional Ultimate Foundation

Version 18.0.0

=====================================
*/


const HalDoChat = {


    history: [],






    send(message){



        if(!message){


            return "";


        }







        console.log(

        "👤 Benutzer:",

        message

        );








        let answer = "";







        /*
        ==========================
        AI Engine Verbindung
        ==========================
        */



        if(window.HalDoAI){



            answer =

            HalDoAI.process(

                message

            );



        }

        else{


            answer =

            "🤖 AI Engine wird geladen...";


        }









        /*
        ==========================
        Verlauf speichern
        ==========================
        */



        this.history.push({



            user:

            message,



            ai:

            answer,



            time:

            new Date()




        });








        /*
        ==========================
        Memory speichern
        ==========================
        */



        if(window.HalDoMemory){



            HalDoMemory.addConversation(


                message,


                answer


            );



        }








        /*
        ==========================
        Antwort sprechen
        ==========================
        */



        if(window.HalDoVoice){



            HalDoVoice.speak(


                answer


            );


        }







        return answer;



    },









    getHistory(){



        return this.history;



    },









    clear(){



        this.history = [];



        console.log(

        "🧹 Chat Verlauf gelöscht"

        );



    }






};









window.HalDoChat =

HalDoChat;







window.addEventListener(

"load",

()=>{


console.log(

"💬 HalDo AI Chat bereit"

);



});