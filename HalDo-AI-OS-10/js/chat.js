/*
========================================
HalDo AI OS Professional 16.0

Chat Controller

========================================
*/


"use strict";





function sendMessage(){



    const input =

    document.getElementById(

        "chat-input"

    );






    const messages =

    document.getElementById(

        "chat-messages"

    );






    if(!input || !messages){


        return;


    }






    const text =

    input.value.trim();






    if(text === ""){


        return;


    }






    addMessage(

        text,

        "user"

    );






    input.value = "";






    setTimeout(

        function(){



            addMessage(

                "🤖 Ich habe deine Nachricht erhalten. Die KI-Schnittstelle wird vorbereitet.",

                "ai"

            );



        },

        500

    );






    saveChatMessage(

        text

    );



}









function addMessage(text, type){



    const messages =

    document.getElementById(

        "chat-messages"

    );






    if(!messages){


        return;


    }






    const div =

    document.createElement(

        "div"

    );






    div.className =

    "message " + type;






    div.innerHTML = text;






    messages.appendChild(

        div

    );






    messages.scrollTop =

    messages.scrollHeight;



}









function saveChatMessage(message){



    if(window.HalDoStorage){



        let history =

        HalDoStorage.load(

            "chat_history"

        );






        if(!history){



            history = [];



        }






        history.push({



            message: message,

            time: new Date().toISOString()



        });






        HalDoStorage.save(

            "chat_history",

            history

        );



    }



}









document.addEventListener(

    "DOMContentLoaded",

    function(){


        console.log(

            "🤖 Chat Modul bereit"

        );


    }

);