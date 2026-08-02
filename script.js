/* =====================================
   HALDO AI OS FOUNDATION v1
   CLEAN FINAL
   SCRIPT PART 1/4
===================================== */


/* =====================================
   HALDO SYSTEM CORE
===================================== */


const HalDoCore = {


    version:"Foundation v1",


    name:"HalDo AI OS",


    status:"starting",



    start(){


        console.log(
            "🤖 HalDo AI OS startet..."
        );


        this.status="online";


    }


};









/* =====================================
   BOOT EXPERIENCE
===================================== */


function startHalDoBoot(){


    const bootScreen =

    document.querySelector(
        ".haldo-boot"
    );



    const message =

    document.getElementById(
        "bootMessage"
    );



    if(!bootScreen)

    return;





    const messages=[


        "HalDo AI OS wird gestartet... 🚀",


        "AI Core wird geladen... 🤖",


        "Systemmodule werden vorbereitet... ⚙️",


        "Willkommen bei HalDo AI OS 💙"


    ];



    let index=0;





    if(message){


        const timer=setInterval(()=>{


            message.innerText=

            messages[index];



            index++;




            if(index >= messages.length){



                clearInterval(timer);


            }



        },900);



    }









    setTimeout(()=>{


        bootScreen.style.opacity="0";



        setTimeout(()=>{


            bootScreen.style.display="none";



            const system =

            document.querySelector(
                ".haldo-system"
            );



            if(system){


                system.classList.remove(
                    "hidden"
                );


            }



        },800);



    },4500);



}









/* =====================================
   NOTIFICATION SYSTEM
===================================== */


function HalDoNotification(text){


    const area =

    document.getElementById(
        "notificationArea"
    );



    if(area){


        area.innerHTML =

        "🔔 " + text;


    }



}









/* =====================================
   START SYSTEM
===================================== */


document.addEventListener(

"DOMContentLoaded",

()=>{


    HalDoCore.start();


    startHalDoBoot();



    setTimeout(()=>{


        HalDoNotification(

            "HalDo AI OS ist bereit. 🚀"

        );


    },5000);



});
/* =====================================
   HALDO AI OS FOUNDATION v1
   CHAT ENGINE
   SCRIPT PART 2/4
===================================== */


/* =====================================
   HALDO MEMORY
===================================== */


const HalDoMemory = {


    messages: [],


    save(message){


        this.messages.push({

            text:message,

            time:new Date().toISOString()

        });



        if(this.messages.length > 30){


            this.messages.shift();


        }



        localStorage.setItem(

            "haldoMemory",

            JSON.stringify(this.messages)

        );


    },





    load(){


        const saved =

        localStorage.getItem(

            "haldoMemory"

        );



        if(saved){


            this.messages =

            JSON.parse(saved);


        }


    }


};









/* =====================================
   HALDO AI PERSONALITY
===================================== */


const HalDoChat = {


    name:"HalDo",



    answer(input){


        const text =

        input.toLowerCase();





        if(

            text.includes("hallo") ||

            text.includes("hi") ||

            text.includes("hey")

        ){


            return (

                "Hallo! 😊💙\n\n" +

                "Ich bin HalDo AI OS. " +

                "Schön, dass du da bist. "

            );


        }









        if(

            text.includes("witz") ||

            text.includes("lustig")

        ){


            return (

                "Warum macht ein Computer nie Urlaub? " +

                "Weil er Angst hat, dass seine Daten verreisen. 🤖😄"

            );


        }









        if(

            text.includes("wer bist du")

        ){


            return (

                "Ich bin HalDo AI OS Foundation v1. 🚀\n\n" +

                "Dein persönlicher digitaler Begleiter."

            );


        }









        if(

            text.includes("wie geht es dir") ||

            text.includes("wie gehts dir")

        ){


            return (

                "Mir geht es gut. 😊\n\n" +

                "Ich bin bereit, mit dir weiter an HalDo zu arbeiten."

            );


        }









        if(

            text.includes("projekt") ||

            text.includes("haldo")

        ){


            return (

                "HalDo AI OS ist dein persönliches AI-System. 💙\n\n" +

                "Wir bauen gerade Boot Experience, Chat, Apps und Module."

            );


        }









        return (

            "Interessant. 🤖\n\n" +

            "Erzähl mir mehr, ich höre zu. 💙"

        );


    }


};









/* =====================================
   CHAT CONNECTION
===================================== */


function connectHalDoChat(){


    const button =

    document.getElementById(

        "sendMessage"

    );



    const input =

    document.getElementById(

        "chatInput"

    );



    const container =

    document.querySelector(

        ".chat-container"

    );



    if(

        !button ||

        !input ||

        !container

    ){

        console.log(

            "Chat Elemente fehlen"

        );


        return;


    }









    button.onclick = ()=>{


        const message =

        input.value.trim();



        if(!message)

        return;





        HalDoMemory.save(

            message

        );





        const user =

        document.createElement(

            "div"

        );



        user.className=

        "user-message";



        user.innerText=

        message;



        container.appendChild(

            user

        );









        const reply =

        HalDoChat.answer(

            message

        );









        setTimeout(()=>{


            const ai =

            document.createElement(

                "div"

            );



            ai.className=

            "ai-message";



            ai.innerText=

            reply;



            container.appendChild(

                ai

            );



            container.scrollTop=

            container.scrollHeight;



        },500);





        input.value="";


    };


}









/* =====================================
   CHAT START
===================================== */


document.addEventListener(

"DOMContentLoaded",

()=>{


    HalDoMemory.load();


    connectHalDoChat();



});