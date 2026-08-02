/* =====================================
   HALDO AI OS v1.0.2
   CONNECTION FIX
   CORE SYSTEM
   PART 1/3
===================================== */


/* =====================================
   HALDO SYSTEM CORE
===================================== */


const HalDoOS = {


    version:"v1.0.2",


    start(){


        console.log(
            "🤖 HalDo AI OS gestartet"
        );


        this.connectNavigation();


        this.connectModules();


    },



    connectModules(){


        console.log(
            "✅ Module Verbindung bereit"
        );


    },









/* =====================================
   NAVIGATION SYSTEM
===================================== */


    connectNavigation(){


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



                    const openPage =

                    document.getElementById(

                        target

                    );



                    if(openPage){


                        openPage.classList.add(

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


                }

            );


        });


    }


};









/* =====================================
   START
===================================== */


document.addEventListener(

"DOMContentLoaded",

()=>{


    HalDoOS.start();


});
/* =====================================
   HALDO AI OS v1.0.2
   CONNECTION FIX
   CHAT CORE
   PART 2/3
===================================== */


/* =====================================
   MEMORY
===================================== */


const HalDoMemory = {


    messages:[],



    save(type,text){


        this.messages.push({

            type:type,

            text:text,

            time:new Date().toISOString()

        });



        if(this.messages.length > 50){

            this.messages.shift();

        }



        localStorage.setItem(

            "haldoMessages",

            JSON.stringify(
                this.messages
            )

        );


    },



    load(){


        const data =

        localStorage.getItem(

            "haldoMessages"

        );



        if(data){


            this.messages =

            JSON.parse(data);


        }


    }


};









/* =====================================
   HALDO ANSWER ENGINE
===================================== */


function HalDoAnswer(input){


    const text =

    input.toLowerCase();





    if(

        text.includes("hallo")

        ||

        text.includes("hi")

        ||

        text.includes("hey")

    ){


        return (

            "Hallo! 👋\n\n" +

            "Ich bin HalDo AI OS. " +

            "Schön, dass du da bist. 💙"

        );


    }









    if(

        text.includes("wie geht es dir")

        ||

        text.includes("wie gehts dir")

    ){


        return (

            "Mir geht es gut. 😊\n\n" +

            "Ich bin bereit, mit dir an HalDo weiterzuarbeiten. 🚀"

        );


    }









    if(

        text.includes("witz")

        ||

        text.includes("lustig")

    ){


        return (

            "Warum hatte der Computer eine Brille?\n\n" +

            Weil er seine Webseite besser sehen wollte. 😄"

        );


    }









    if(

        text.includes("was kannst du")

    ){


        return (

            "Ich kann dich unterstützen bei:\n\n" +

            "🤖 Chat\n" +

            "📁 Dateien\n" +

            "📝 Schreiben\n" +

            "⚙️ Einstellungen\n\n" +

            "und beim Aufbau von HalDo AI OS. 🚀"

        );


    }









    return (

        "Ich habe dich verstanden. 💙\n\n" +

        "Du hast gesagt:\n" +

        input

    );


}









/* =====================================
   CHAT CONNECTION
===================================== */


function ConnectHalDoChat(){


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

            "user",

            message

        );



        const user =

        document.createElement(

            "div"

        );



        user.className=

        "user-message";



        user.textContent=

        message;



        container.appendChild(

            user

        );









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



            ai.textContent=

            answer;



            container.appendChild(

                ai

            );



            HalDoMemory.save(

                "ai",

                answer

            );



            container.scrollTop=

            container.scrollHeight;



        },400);



        input.value="";


    };


}









document.addEventListener(

"DOMContentLoaded",

()=>{


    HalDoMemory.load();


    ConnectHalDoChat();


});
/* =====================================
   HALDO AI OS v1.0.2
   CONNECTION FIX
   FINAL MODULE CONNECTION
   PART 3/3
===================================== */


/* =====================================
   DARK MODE
===================================== */


function ConnectDarkMode(){


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



        localStorage.setItem(

            "haldoDarkMode",

            document.body.classList.contains(

                "dark-mode"

            )

        );


    };


}









/* =====================================
   LANGUAGE CONNECTION
===================================== */


const HalDoLanguages = {


    current:"de-DE",



    set(lang){


        this.current=lang;


        localStorage.setItem(

            "haldoLanguage",

            lang

        );


    }


};









function ConnectLanguage(){


    const select =

    document.getElementById(

        "languageSelect"

    );



    if(!select)

    return;



    const saved =

    localStorage.getItem(

        "haldoLanguage"

    );



    if(saved){

        select.value=saved;

    }





    select.onchange=()=>{


        HalDoLanguages.set(

            select.value

        );


    };


}









/* =====================================
   FILE SYSTEM
===================================== */


function ConnectFiles(){


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





    upload.onchange=()=>{


        list.innerHTML="";



        Array.from(

            upload.files

        ).forEach(file=>{


            const item =

            document.createElement(

                "p"

            );



            item.textContent=

            "📄 " + file.name;



            list.appendChild(

                item

            );


        });


    };


}









/* =====================================
   WRITING SYSTEM
===================================== */


function ConnectWriter(){


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





    button.onclick=()=>{


        localStorage.setItem(

            "haldoDocument",

            text.value

        );



        alert(

            "💾 Dokument gespeichert"

        );


    };


}









/* =====================================
   VOICE PREPARATION
===================================== */


const HalDoVoiceSystem = {


    enabled:false,



    speak(text){


        if(!this.enabled)

        return;



        if(window.speechSynthesis){


            const voice =

            new SpeechSynthesisUtterance(

                text

            );



            voice.lang="de-DE";



            speechSynthesis.speak(

                voice

            );


        }


    }


};









/* =====================================
   FINAL CHECK
===================================== */


function HalDoSystemCheck(){


    console.log(

        "🚀 HalDo AI OS v1.0.2 ONLINE"

    );


    console.log(

        "✅ Navigation"

    );


    console.log(

        "✅ Chat"

    );


    console.log(

        "✅ Dateien"

    );


    console.log(

        "✅ Einstellungen"

    );


}









/* =====================================
   FINAL START
===================================== */


document.addEventListener(

"DOMContentLoaded",

()=>{


    ConnectDarkMode();


    ConnectLanguage();


    ConnectFiles();


    ConnectWriter();


    HalDoSystemCheck();



});