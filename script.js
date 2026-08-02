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
/* =====================================
   HALDO AI OS FOUNDATION v1
   MODULE SYSTEM
   SCRIPT PART 3/4
===================================== */


/* =====================================
   FILE SYSTEM
===================================== */


function connectFileSystem(){


    const upload =

    document.getElementById(
        "fileUpload"
    );


    const list =

    document.getElementById(
        "fileList"
    );


    if(!upload || !list)

    return;




    upload.addEventListener(

        "change",

        ()=>{


            list.innerHTML="";


            Array.from(
                upload.files
            ).forEach(file=>{


                const item =

                document.createElement(
                    "p"
                );


                item.innerText=

                "📁 " + file.name;


                list.appendChild(
                    item
                );


            });


        }

    );


}









/* =====================================
   WRITING SYSTEM
===================================== */


function connectWriter(){


    const text =

    document.getElementById(
        "writerText"
    );


    const save =

    document.getElementById(
        "saveDocument"
    );



    if(!text || !save)

    return;



    const old =

    localStorage.getItem(
        "haldoDocument"
    );


    if(old){


        text.value=old;


    }



    save.onclick=()=>{


        localStorage.setItem(

            "haldoDocument",

            text.value

        );


        alert(
            "📝 Dokument gespeichert."
        );


    };


}









/* =====================================
   NOTES SYSTEM
===================================== */


function connectNotes(){


    const input =

    document.getElementById(
        "noteInput"
    );


    const button =

    document.getElementById(
        "addNote"
    );


    const list =

    document.getElementById(
        "noteList"
    );



    if(
        !input ||
        !button ||
        !list
    )

    return;




    button.onclick=()=>{


        if(!input.value)

        return;



        const note =

        document.createElement(
            "p"
        );



        note.innerText=

        "📒 " + input.value;



        list.appendChild(
            note
        );



        input.value="";


    };


}









/* =====================================
   PDF PREPARATION
===================================== */


function connectPDF(){


    const button =

    document.getElementById(
        "createPDF"
    );


    if(!button)

    return;




    button.onclick=()=>{


        alert(

            "📄 PDF Creator ist vorbereitet."

        );


    };


}









/* =====================================
   CALENDAR SYSTEM
===================================== */


function connectCalendar(){


    const button =

    document.getElementById(
        "saveEvent"
    );


    const date =

    document.getElementById(
        "calendarDate"
    );


    const eventText =

    document.getElementById(
        "calendarEvent"
    );



    const list =

    document.getElementById(
        "calendarList"
    );



    if(
        !button ||
        !date ||
        !eventText ||
        !list
    )

    return;




    button.onclick=()=>{


        const item =

        document.createElement(
            "p"
        );



        item.innerText=

        "📅 " +

        date.value +

        " - " +

        eventText.value;



        list.appendChild(
            item
        );



    };


}









/* =====================================
   MODULE START
===================================== */


document.addEventListener(

"DOMContentLoaded",

()=>{


    connectFileSystem();


    connectWriter();


    connectNotes();


    connectPDF();


    connectCalendar();



});
/* =====================================
   HALDO AI OS FOUNDATION v1
   FINAL CONNECTION
   SCRIPT PART 4/4 FINAL
===================================== */


/* =====================================
   DARK MODE
===================================== */


function connectDarkMode(){


    const button =

    document.getElementById(
        "darkModeButton"
    );


    if(!button)

    return;



    const saved =

    localStorage.getItem(
        "haldoDarkMode"
    );



    if(saved==="true"){


        document.body.classList.add(
            "dark-mode"
        );


    }





    button.onclick=()=>{


        document.body.classList.toggle(
            "dark-mode"
        );



        const active =

        document.body.classList.contains(
            "dark-mode"
        );



        localStorage.setItem(

            "haldoDarkMode",

            active

        );


    };


}









/* =====================================
   SETTINGS
===================================== */


function connectSettings(){


    const name =

    document.getElementById(
        "userName"
    );


    if(!name)

    return;



    const savedName =

    localStorage.getItem(
        "haldoUserName"
    );



    if(savedName){


        name.value=savedName;


    }





    name.onchange=()=>{


        localStorage.setItem(

            "haldoUserName",

            name.value

        );


    };


}









/* =====================================
   VOICE PREPARATION
===================================== */


const HalDoVoice = {


    enabled:false,



    speak(text){


        if(!this.enabled)

        return;



        if(
            "speechSynthesis"
            in window
        ){


            const voice =

            new SpeechSynthesisUtterance(
                text
            );


            voice.lang="de-DE";


            voice.rate=1;


            speechSynthesis.speak(
                voice
            );


        }


    }


};









function enableVoice(){


    const saved =

    localStorage.getItem(
        "haldoVoice"
    );



    if(saved==="true"){


        HalDoVoice.enabled=true;


    }


}









/* =====================================
   AI SYSTEM CONNECTION
===================================== */


function HalDoSystemReady(){


    console.log(

        "🤖 HalDo AI Core online"

    );



    HalDoNotification(

        "HalDo AI OS Foundation v1 ist bereit 🚀"

    );


}









/* =====================================
   START ALL MODULES
===================================== */


document.addEventListener(

"DOMContentLoaded",

()=>{


    connectDarkMode();


    connectSettings();


    enableVoice();


    HalDoSystemReady();



    console.log(

        "💙 HalDo AI OS Foundation v1 CLEAN FINAL gestartet"

    );


});
/* =====================================
   HALDO AI OS FOUNDATION v1.0.1
   CLEAN SYSTEM FIX
   PART 1/3
===================================== */


const HalDoSystem = {


    version:"v1.0.1",


    modules:[],



    register(module){

        this.modules.push(module);

        console.log(
            "✅ Modul geladen:",
            module
        );

    },



    start(){

        console.log(
            "🤖 HalDo AI OS System Start"
        );


        this.register("Boot");


        this.register("Chat");


        this.register("Memory");


        this.register("Apps");


        this.register("Voice");


        HalDoNotification(
            "HalDo AI OS ist bereit 🚀"
        );


    }


};









/* =====================================
   REMOVE OLD CLICK PROBLEMS
===================================== */


function HalDoSafeClick(id, callback){


    const element =

    document.getElementById(id);



    if(!element){

        console.log(
            "Element fehlt:",
            id
        );

        return;

    }



    element.onclick = callback;


}









/* =====================================
   CLEAN START
===================================== */


document.addEventListener(

"DOMContentLoaded",

()=>{


    HalDoSystem.start();


});
/* =====================================
   HALDO AI OS FOUNDATION v1.0.1
   CLEAN FIX
   CHAT + LANGUAGE CORE
   PART 2/3
===================================== */


/* =====================================
   LANGUAGE SYSTEM
===================================== */


const HalDoLanguage = {


    current:"de-DE",



    texts:{


        "de-DE":{

            hello:
            "Hallo! Schön, dass du wieder da bist. Ich bin HalDo AI OS. 💙",

            ready:
            "HalDo ist bereit. 🚀",

            help:
            "Ich helfe dir bei Chat, Dateien, Organisation und deinem AI OS Projekt."

        },



        "en-US":{

            hello:
            "Hello! Nice to see you again. I am HalDo AI OS. 💙",

            ready:
            "HalDo is ready. 🚀",

            help:
            "I can help you with chat, files, organization and your AI OS project."

        },



        "fr-FR":{

            hello:
            "Bonjour! Je suis HalDo AI OS. 💙",

            ready:
            "HalDo est prêt. 🚀",

            help:
            "Je peux vous aider avec le chat, les fichiers et votre projet AI OS."

        },


        "es-ES":{

            hello:
            "Hola! Soy HalDo AI OS. 💙",

            ready:
            "HalDo está listo. 🚀",

            help:
            "Puedo ayudarte con chat, archivos y tu proyecto AI OS."

        }


    },



    set(language){


        if(this.texts[language]){


            this.current=language;


            localStorage.setItem(

                "haldoLanguage",

                language

            );


        }


    },



    get(key){


        return this.texts[this.current][key];


    }


};









/* =====================================
   CHAT ENGINE FIX
===================================== */


function HalDoAnswer(input){


    const text =

    input.toLowerCase();





    if(

        text.includes("hallo") ||

        text.includes("hello") ||

        text.includes("hi")

    ){


        return HalDoLanguage.get(
            "hello"
        );


    }









    if(

        text.includes("hilfe") ||

        text.includes("help")

    ){


        return HalDoLanguage.get(
            "help"
        );


    }









    if(

        text.includes("wer bist du")

        ||

        text.includes("who are you")

    ){


        return (

            "Ich bin HalDo AI OS. 🤖\n\n" +

            "Dein persönlicher digitaler Assistent."

        );


    }









    if(

        text.includes("witz")

        ||

        text.includes("joke")

    ){


        return (

            "Warum war der Computer müde? " +

            "Weil er zu viele Tabs offen hatte. 😄"

        );


    }









    return (

        HalDoLanguage.get(
            "ready"
        )

        +

        "\n\n"

        +

        "Du hast gesagt: "

        +

        input

    );


}









/* =====================================
   CHAT BUTTON CONNECTION FIX
===================================== */


function FixHalDoChat(){


    const button =

    document.getElementById(

        "sendMessage"

    );



    const input =

    document.getElementById(

        "chatInput"

    );



    const box =

    document.querySelector(

        ".chat-container"

    );





    if(

        !button ||

        !input ||

        !box

    ){


        console.log(
            "Chat wartet auf Elemente"
        );


        return;


    }









    button.addEventListener(

        "click",

        ()=>{


            const message =

            input.value.trim();



            if(!message)

            return;





            const user =

            document.createElement(
                "div"
            );


            user.className=

            "user-message";


            user.innerText=

            message;



            box.appendChild(
                user
            );





            if(
                typeof HalDoMemory !== "undefined"
            ){

                HalDoMemory.save(
                    message
                );

            }









            const answer =

            HalDoAnswer(
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

                answer;



                box.appendChild(
                    ai
                );



                if(
                    typeof HalDoVoice !== "undefined"
                ){

                    HalDoVoice.speak(
                        answer
                    );

                }



            },500);



            input.value="";



        }

    );


}









/* =====================================
   LANGUAGE LOAD
===================================== */


function LoadHalDoLanguage(){


    const saved =

    localStorage.getItem(

        "haldoLanguage"

    );



    if(saved){


        HalDoLanguage.set(
            saved
        );


    }


}









document.addEventListener(

"DOMContentLoaded",

()=>{


    LoadHalDoLanguage();


    FixHalDoChat();


});