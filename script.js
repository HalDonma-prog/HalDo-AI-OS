/* =====================================
   HALDO AI OS 10.1
   CLEAN SCRIPT
   PART 1/4
===================================== */



/* =====================================
   SYSTEM CORE
===================================== */


const HalDo = {


    version:"10.1",


    ready:false,


    memory:{},



    start(){


        this.ready=true;


        console.log(

            "🚀 HalDo AI OS 10.1 gestartet"

        );


    },



    saveMemory(){


        localStorage.setItem(

            "haldoMemory",

            JSON.stringify(this.memory)

        );


    },



    loadMemory(){


        const data =

        localStorage.getItem(
            "haldoMemory"
        );



        if(data){


            this.memory =
            JSON.parse(data);


        }


    }


};









/* =====================================
   NAVIGATION SYSTEM
===================================== */


function setupNavigation(){


    const buttons =

    document.querySelectorAll(
        ".nav-button"
    );



    const pages =

    document.querySelectorAll(
        ".page"
    );





    buttons.forEach(button=>{


        button.addEventListener(
        "click",
        ()=>{



            const target =

            button.dataset.page;



            if(!target)
            return;



            pages.forEach(page=>{


                page.classList.remove(
                    "active"
                );


            });



            const selected =

            document.getElementById(
                target
            );



            if(selected){


                selected.classList.add(
                    "active"
                );


            }



            buttons.forEach(btn=>{


                btn.classList.remove(
                    "active"
                );


            });



            button.classList.add(
                "active"
            );



        });



    });


}









/* =====================================
   START BUTTON CONNECTION
===================================== */


function setupStartButtons(){


    const buttons =

    document.querySelectorAll(
        ".primary-button"
    );



    buttons.forEach(button=>{


        button.addEventListener(
        "click",
        ()=>{


            console.log(

                "Button:",
                button.innerText

            );


        });


    });


}









/* =====================================
   SYSTEM START
===================================== */


document.addEventListener(

"DOMContentLoaded",

()=>{


    HalDo.loadMemory();


    HalDo.start();


    setupNavigation();


    setupStartButtons();



});
/* =====================================
   HALDO AI OS 10.1
   CHAT SYSTEM
   PART 2/4
===================================== */



/* =====================================
   CHAT MEMORY
===================================== */


const HalDoChatMemory = {


    messages:[],



    add(message){


        this.messages.push(message);


        localStorage.setItem(

            "haldoChat",

            JSON.stringify(
                this.messages
            )

        );


    },



    load(){


        const data =

        localStorage.getItem(
            "haldoChat"
        );



        if(data){


            this.messages =

            JSON.parse(data);


        }


    }


};









/* =====================================
   AI RESPONSE ENGINE
===================================== */


const HalDoChat = {


    createAnswer(input){


        const text =

        input.toLowerCase();



        if(
            text.includes("hallo")
        ){


            return "Hallo! Ich bin HalDo AI. Wie kann ich helfen?";


        }



        if(
            text.includes("name")
        ){


            return "Ich bin HalDo AI OS v10.1";


        }



        if(
            text.includes("hilfe")
        ){


            return "Ich unterstütze dich mit Chat, Apps und Systemfunktionen.";


        }



        return (

            "Ich habe deine Nachricht erhalten: "

            + input

        );


    }


};









/* =====================================
   CHAT INTERFACE
===================================== */


function setupChat(){


    const input =

    document.getElementById(
        "chatInput"
    );



    const button =

    document.getElementById(
        "sendMessage"
    );



    const container =

    document.querySelector(
        ".chat-container"
    );



    if(
        !input ||
        !button ||
        !container
    )
    return;









    function addMessage(
        text,
        type
    ){



        const message =

        document.createElement(
            "div"
        );



        message.className =

        type;



        message.innerText =

        text;



        container.appendChild(
            message
        );



        container.scrollTop =

        container.scrollHeight;


    }









    button.addEventListener(
    "click",
    ()=>{


        const text =

        input.value.trim();



        if(!text)
        return;



        addMessage(

            text,

            "user-message"

        );



        HalDoChatMemory.add({

            type:"user",

            text:text

        });



        const answer =

        HalDoChat.createAnswer(
            text
        );



        setTimeout(()=>{


            addMessage(

                answer,

                "ai-message"

            );



            HalDoChatMemory.add({

                type:"ai",

                text:answer

            });



        },400);



        input.value="";


    });


}









/* =====================================
   NOTIFICATION SYSTEM
===================================== */


const HalDoNotification = {


    add(text){


        const list =

        document.getElementById(
            "notificationList"
        );



        if(!list)
        return;



        const item =

        document.createElement(
            "p"
        );



        item.className =
        "notification-item";



        item.innerText =
        text;



        list.appendChild(
            item
        );


    }


};









/* =====================================
   CHAT START CONNECTION
===================================== */


document.addEventListener(

"DOMContentLoaded",

()=>{


    HalDoChatMemory.load();


    setupChat();



    HalDoNotification.add(

        "🤖 HalDo Chat bereit"

    );


});