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