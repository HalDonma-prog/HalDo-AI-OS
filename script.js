/* =====================================
   HALDO AI OS v10.3 CLEAN FINAL
   PART 1/4

   Navigation
   System Start
===================================== */



console.log(
    "🚀 HalDo AI OS v10.3 CLEAN START"
);





/* =====================================
   PAGE NAVIGATION
===================================== */


function initNavigation(){


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


            }
        );


    });


}









/* =====================================
   DARK MODE
===================================== */


function initDarkMode(){


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

                "haldoDark",

                document.body.classList.contains(
                    "dark-mode"
                )

            );


        }
    );





    const saved =

    localStorage.getItem(
        "haldoDark"
    );



    if(saved==="true"){


        document.body.classList.add(
            "dark-mode"
        );


    }


}









/* =====================================
   SYSTEM START
===================================== */


document.addEventListener(
"DOMContentLoaded",
()=>{


    initNavigation();


    initDarkMode();



    console.log(
        "✅ HalDo Navigation aktiv"
    );


});
/* =====================================
   HALDO AI OS v10.3 CLEAN FINAL
   PART 2/4

   Chat Engine
   Memory System
===================================== */





/* =====================================
   HALDO MEMORY
===================================== */


const HalDoMemory = {


    history: [],



    save(message){


        this.history.push({

            text: message,

            time: new Date().toISOString()

        });



        if(this.history.length > 30){


            this.history.shift();


        }



        localStorage.setItem(

            "haldoMemory",

            JSON.stringify(
                this.history
            )

        );


    },





    load(){


        const data =

        localStorage.getItem(
            "haldoMemory"
        );



        if(data){


            this.history =

            JSON.parse(
                data
            );


        }


    }


};









/* =====================================
   HALDO AI RESPONSE ENGINE
===================================== */


function HalDoAnswer(input){



    const text =

    input.toLowerCase();





    HalDoMemory.save(
        input
    );





    if(
        text.includes("hallo") ||
        text.includes("hi") ||
        text.includes("hey")
    ){


        return (

            "Hallo! 👋\n\n" +

            "Ich bin HalDo AI OS v10.3. " +

            "Ich bin bereit, dir zu helfen. 🤖💙"

        );


    }









    if(
        text.includes("wer bist du") ||
        text.includes("was bist du")
    ){


        return (

            "Ich bin HalDo AI OS v10.3.\n\n" +

            "Dein persönlicher AI-Assistent " +

            "für dein digitales System. 🚀"

        );


    }









    if(
        text.includes("wie geht es dir") ||
        text.includes("wie gehts")
    ){


        return (

            "Mir geht es gut. 😊\n\n" +

            "Ich bin aktiv und bereit, " +

            "mit dir weiterzuarbeiten."

        );


    }









    if(
        text.includes("witz") ||
        text.includes("lustig")
    ){


        return (

            "Warum hat der Computer Urlaub gemacht? " +

            "Er brauchte eine Pause vom Rechnen. 😄💻"

        );


    }









    if(
        text.includes("erinnerst du dich")
    ){


        return (

            "Ja. Ich speichere den aktuellen " +

            "Gesprächsverlauf lokal im System. 💾"

        );


    }









    if(
        text.includes("hilfe")
    ){


        return (

            "🤖 HalDo Hilfe:\n\n" +

            "- Chat\n" +

            "- Dateien\n" +

            "- Schreiben\n" +

            "- Einstellungen\n" +

            "- Weitere Module folgen"

        );


    }









    return (

        "Ich verstehe. 💙\n\n" +

        "Erzähl mir mehr darüber:\n\n" +

        input

    );


}









/* =====================================
   CHAT CONNECTION
===================================== */


function initChat(){


    const button =

    document.getElementById(
        "sendMessage"
    );



    const input =

    document.getElementById(
        "chatInput"
    );



    const container =

    document.getElementById(
        "chatContainer"
    );





    if(
        !button ||
        !input ||
        !container
    ){

        console.log(
            "⚠️ Chat Elemente fehlen"
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



            user.className =

            "user-message";



            user.innerText =

            message;



            container.appendChild(
                user
            );









            const answer =

            HalDoAnswer(
                message
            );





            setTimeout(
            ()=>{


                const ai =

                document.createElement(
                    "div"
                );



                ai.className =

                "ai-message";



                ai.innerText =

                answer;



                container.appendChild(
                    ai
                );



                container.scrollTop =

                container.scrollHeight;



            },
            400
            );





            input.value="";


        }
    );


}









/* =====================================
   LOAD MEMORY
===================================== */


document.addEventListener(
"DOMContentLoaded",
()=>{


    HalDoMemory.load();


    initChat();



    console.log(
        "🤖 HalDo Chat aktiv"
    );


});
/* =====================================
   HALDO AI OS v10.3 CLEAN FINAL
   PART 3/4

   Module Connection
   Files
   Writing
   Notes
   PDF
   Calendar
===================================== */





/* =====================================
   FILE SYSTEM
===================================== */


function initFileSystem(){


    const upload =

    document.getElementById(
        "fileUpload"
    );



    const list =

    document.getElementById(
        "fileList"
    );





    if(
        !upload ||
        !list
    )

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

                "📄 " + file.name;



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


function initWriting(){


    const button =

    document.getElementById(
        "saveDocument"
    );



    const text =

    document.getElementById(
        "writerText"
    );





    if(
        !button ||
        !text
    )

    return;





    const saved =

    localStorage.getItem(
        "haldoWriter"
    );



    if(saved){


        text.value = saved;


    }





    button.addEventListener(
        "click",
        ()=>{


            localStorage.setItem(

                "haldoWriter",

                text.value

            );



            alert(
                "📝 Dokument gespeichert."
            );


        }
    );


}









/* =====================================
   NOTES SYSTEM
===================================== */


function initNotes(){


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





    let notes =

    JSON.parse(

        localStorage.getItem(
            "haldoNotes"
        )

        ||

        "[]"

    );





    function render(){


        list.innerHTML="";



        notes.forEach(note=>{


            const p =

            document.createElement(
                "p"
            );



            p.innerText =
            
            "📒 " + note;



            list.appendChild(
                p
            );


        });


    }





    render();





    button.addEventListener(
        "click",
        ()=>{


            if(!input.value.trim())

            return;



            notes.push(
                input.value
            );



            localStorage.setItem(

                "haldoNotes",

                JSON.stringify(
                    notes
                )

            );



            input.value="";



            render();


        }
    );


}









/* =====================================
   PDF PREPARATION
===================================== */


function initPDF(){


    const button =

    document.getElementById(
        "createPDF"
    );



    const title =

    document.getElementById(
        "pdfTitle"
    );



    const content =

    document.getElementById(
        "pdfText"
    );





    if(
        !button ||
        !title ||
        !content
    )

    return;





    button.addEventListener(
        "click",
        ()=>{


            alert(

                "📄 PDF Creator vorbereitet:\n\n"

                +

                title.value

            );


        }
    );


}









/* =====================================
   CALENDAR SYSTEM
===================================== */


function initCalendar(){


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





    let events =

    JSON.parse(

        localStorage.getItem(
            "haldoCalendar"
        )

        ||

        "[]"

    );





    function render(){


        list.innerHTML="";



        events.forEach(event=>{


            const p =

            document.createElement(
                "p"
            );



            p.innerText =

            "📅 "

            +

            event.date

            +

            " - "

            +

            event.text;



            list.appendChild(
                p
            );


        });


    }





    render();





    button.addEventListener(
        "click",
        ()=>{


            events.push({

                date:date.value,

                text:eventText.value

            });



            localStorage.setItem(

                "haldoCalendar",

                JSON.stringify(
                    events
                )

            );



            render();


        }
    );


}









/* =====================================
   MODULE START
===================================== */


document.addEventListener(
"DOMContentLoaded",
()=>{


    initFileSystem();

    initWriting();

    initNotes();

    initPDF();

    initCalendar();



    console.log(
        "🧩 HalDo Module aktiv"
    );


});
/* =====================================
   HALDO AI OS v10.3 CLEAN FINAL
   PART 4/4 FINAL

   Settings
   Voice
   AI Connection
   System Finish
===================================== */





/* =====================================
   SETTINGS SYSTEM
===================================== */


function initSettings(){


    const nameInput =

    document.getElementById(
        "userName"
    );



    const emailInput =

    document.getElementById(
        "userEmail"
    );





    if(nameInput){


        const savedName =

        localStorage.getItem(
            "haldoUserName"
        );



        if(savedName){


            nameInput.value = savedName;


        }



        nameInput.addEventListener(
            "change",
            ()=>{


                localStorage.setItem(

                    "haldoUserName",

                    nameInput.value

                );


            }
        );


    }









    if(emailInput){


        emailInput.addEventListener(
            "change",
            ()=>{


                localStorage.setItem(

                    "haldoEmail",

                    emailInput.value

                );


            }
        );


    }


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
            window.speechSynthesis
        ){


            const speech =

            new SpeechSynthesisUtterance(
                text
            );



            speech.lang =
            "de-DE";



            window.speechSynthesis.speak(
                speech
            );


        }


    }


};









function initVoice(){


    const saved =

    localStorage.getItem(
        "haldoVoice"
    );



    if(saved==="true"){


        HalDoVoice.enabled=true;


    }


}









/* =====================================
   AI CORE CONNECTION
===================================== */


const HalDoCore = {


    status(){


        return {

            system:"HalDo AI OS",

            version:"10.3",

            status:"Online"

        };


    },



    message(){

        return (

            "🤖 HalDo AI OS v10.3 läuft."

        );


    }


};









/* =====================================
   SYSTEM START FINAL
===================================== */


document.addEventListener(
"DOMContentLoaded",
()=>{


    initSettings();


    initVoice();



    console.log(

        "================================"

    );


    console.log(

        "🤖 HalDo AI OS v10.3 CLEAN FINAL"

    );


    console.log(

        "✅ Navigation Online"

    );


    console.log(

        "✅ Chat Online"

    );


    console.log(

        "✅ Module Online"

    );


    console.log(

        "🚀 System bereit"

    );


    console.log(

        "================================"

    );


});