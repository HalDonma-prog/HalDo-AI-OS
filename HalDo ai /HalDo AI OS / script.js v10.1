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
/* =====================================
   HALDO AI OS 10.1
   SYSTEM FUNCTIONS
   PART 3/4
===================================== */



/* =====================================
   DARK MODE
===================================== */


function setupDarkMode(){


    const button =

    document.getElementById(
        "darkModeButton"
    );



    if(!button)
    return;



    button.addEventListener(
    "click",
    ()=>{


        document.body.classList.toggle(
            "dark-mode"
        );



        localStorage.setItem(

            "haldoDarkMode",

            document.body.classList.contains(
                "dark-mode"
            )

        );


    });


}









function loadDarkMode(){


    const enabled =

    localStorage.getItem(
        "haldoDarkMode"
    );



    if(enabled === "true"){


        document.body.classList.add(
            "dark-mode"
        );


    }


}









/* =====================================
   SETTINGS SYSTEM
===================================== */


const HalDoSettings = {


    save(){


        const settings = {


            name:

            document.getElementById(
                "userName"
            )?.value || "",



            email:

            document.getElementById(
                "userEmail"
            )?.value || "",



            language:

            document.getElementById(
                "languageSelect"
            )?.value || "de-DE"


        };



        localStorage.setItem(

            "haldoSettings",

            JSON.stringify(settings)

        );


    },









    load(){


        const data =

        localStorage.getItem(
            "haldoSettings"
        );



        if(!data)
        return;



        const settings =

        JSON.parse(data);



        if(
            document.getElementById(
                "userName"
            )
        )

        document.getElementById(
            "userName"
        ).value = settings.name;



    }


};









/* =====================================
   FILE SYSTEM
===================================== */


function setupFileSystem(){


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



            item.innerText =

            "📁 " + file.name;



            list.appendChild(
                item
            );


        });


    });


}









/* =====================================
   WRITING SAVE
===================================== */


function setupWriting(){


    const button =

    document.getElementById(
        "saveDocument"
    );



    const text =

    document.getElementById(
        "writerText"
    );



    if(!button || !text)
    return;



    button.addEventListener(
    "click",
    ()=>{


        localStorage.setItem(

            "haldoDocument",

            text.value

        );



        HalDoNotification.add(

            "📝 Dokument gespeichert"

        );


    });


}









/* =====================================
   NOTES SYSTEM
===================================== */


function setupNotes(){


    const button =

    document.getElementById(
        "addNote"
    );



    const input =

    document.getElementById(
        "noteInput"
    );



    const list =

    document.getElementById(
        "noteList"
    );



    if(!button || !input || !list)
    return;



    button.addEventListener(
    "click",
    ()=>{


        if(!input.value)
        return;



        const note =

        document.createElement(
            "p"
        );



        note.innerText =

        "📒 " + input.value;



        list.appendChild(
            note
        );



        input.value="";


    });


}









/* =====================================
   CONNECTION
===================================== */


document.addEventListener(

"DOMContentLoaded",

()=>{


    setupDarkMode();


    loadDarkMode();


    HalDoSettings.load();


    setupFileSystem();


    setupWriting();


    setupNotes();


});
/* =====================================
   HALDO AI OS 10.1
   FINAL MODULE CONNECTION
   PART 4/4
===================================== */



/* =====================================
   PDF CREATOR
===================================== */


function setupPDF(){


    const button =

    document.getElementById(
        "createPDF"
    );



    if(!button)
    return;



    button.addEventListener(
    "click",
    ()=>{


        const title =

        document.getElementById(
            "pdfTitle"
        )?.value || "HalDo PDF";



        const text =

        document.getElementById(
            "pdfText"
        )?.value || "";



        console.log(

            "📄 PDF vorbereitet:",

            title,

            text

        );



        HalDoNotification.add(

            "📄 PDF wurde vorbereitet"

        );


    });


}









/* =====================================
   CALENDAR SYSTEM
===================================== */


function setupCalendar(){


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



    button.addEventListener(
    "click",
    ()=>{


        const item =

        document.createElement(
            "p"
        );



        item.innerText =

        "📅 "
        +
        date.value
        +
        " - "
        +
        eventText.value;



        list.appendChild(
            item
        );



        eventText.value="";


    });


}









/* =====================================
   MAIL SYSTEM
===================================== */


function setupMail(){


    const button =

    document.getElementById(
        "sendMail"
    );



    if(!button)
    return;



    button.addEventListener(
    "click",
    ()=>{


        const receiver =

        document.getElementById(
            "mailReceiver"
        )?.value;



        console.log(

            "📧 Mail an:",

            receiver

        );



        HalDoNotification.add(

            "📧 Mail vorbereitet"

        );


    });


}









/* =====================================
   SYSTEM STATUS
===================================== */


function systemReady(){


    HalDo.ready=true;



    console.log(

        "🚀 HalDo AI OS 10.1 vollständig verbunden"

    );



    HalDoNotification.add(

        "✅ Alle Module bereit"

    );


}









/* =====================================
   FINAL START CONNECTION
===================================== */


document.addEventListener(

"DOMContentLoaded",

()=>{


    setupPDF();


    setupCalendar();


    setupMail();



    systemReady();


});