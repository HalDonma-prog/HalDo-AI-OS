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



        this.history.push({

            user: message,

            time:
            new Date()

        });



        let answer =
        "🤖 HalDo AI verarbeitet: "
        + message;



        if(
            window.HalDoAI
        ){


            answer =
            HalDoAI.answer(
                message
            );


        }





        this.history.push({

            ai: answer,

            time:
            new Date()

        });





        if(
            window.HalDoVoice
        ){


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
        "🧹 Chat gelöscht"
        );


    }



};





window.HalDoChat =
HalDoChat;






window.addEventListener(

"load",

()=>{


console.log(
"💬 AI Chat System bereit"
);



}

);