/* =====================================
   HALDO AI CHAT v10.2
   PERSONALITY ENGINE
   PART 1/4
===================================== */



const HalDoPersonality = {


    name:"HalDo",


    mood:"freundlich",



    greetings:[

        "Hallo! Schön, dass du wieder da bist. 🤖",

        "Willkommen zurück! Was machen wir heute? 🚀",

        "Hey! HalDo AI ist bereit. 💙"

    ],



    jokes:[

        "Warum hat der Computer Kaffee getrunken? Weil er Daten verarbeiten musste. ☕😄",

        "Ich habe keine Pause-Taste, aber ich lerne gerne weiter. 🤖",

        "Mein Lieblingsort ist die Cloud. Da ist immer Platz. ☁️"

    ],



    encouragement:[

        "Das klingt interessant! Lass uns das zusammen machen. 💙",

        "Gute Idee! Wir können das Schritt für Schritt aufbauen. 🚀",

        "Ich bin dabei. Was ist der nächste Schritt?"

    ]

};









/* =====================================
   CHAT RESPONSE ENGINE v10.2
===================================== */


function HalDoResponse(input){


    const text =

    input.toLowerCase();





    if(

        text.includes("hallo") ||

        text.includes("hi") ||

        text.includes("hey")

    ){


        return (

            HalDoPersonality.greetings[

            Math.floor(

            Math.random()

            *

            HalDoPersonality.greetings.length

            )

            ]

        );


    }









    if(

        text.includes("witz") ||

        text.includes("lustig") ||

        text.includes("spaß")

    ){


        return (

            HalDoPersonality.jokes[

            Math.floor(

            Math.random()

            *

            HalDoPersonality.jokes.length

            )

            ]

        );


    }









    if(

        text.includes("danke")

    ){


        return "Sehr gerne! 😊 Ich helfe dir jederzeit weiter.";

    }









    if(

        text.includes("wer bist du") ||

        text.includes("was bist du")

    ){


        return (

            "Ich bin HalDo AI OS v10.2. " +

            "Dein persönlicher digitaler Assistent. 🤖💙"

        );


    }









    return (

        HalDoPersonality.encouragement[

        Math.floor(

        Math.random()

        *

        HalDoPersonality.encouragement.length

        )

        ]

        +

        "\n\nDu hast gesagt: "

        +

        input

    );


}
/* =====================================
   HALDO AI CHAT v10.2
   CONVERSATION ENGINE
   PART 2/4
===================================== */



const HalDoConversation = {


    lastTopic:"",


    userMood:"neutral",


    context:[],




    remember(message){


        this.context.push(message);



        if(this.context.length > 10){


            this.context.shift();


        }



        localStorage.setItem(

            "haldoConversation",

            JSON.stringify(this.context)

        );


    },







    load(){


        const data =

        localStorage.getItem(

            "haldoConversation"

        );



        if(data){


            this.context =

            JSON.parse(data);


        }


    }


};









/* =====================================
   MOOD DETECTION
===================================== */


function HalDoMood(text){


    const message =

    text.toLowerCase();





    if(

        message.includes("traurig") ||

        message.includes("schlecht") ||

        message.includes("problem")

    ){


        HalDoConversation.userMood="sad";


        return "Ich merke, dass etwas nicht ganz gut läuft. Ich höre dir zu. 💙";


    }









    if(

        message.includes("super") ||

        message.includes("gut") ||

        message.includes("perfekt")

    ){


        HalDoConversation.userMood="happy";


        return "Das klingt gut! Freut mich, dass es läuft. 😊";


    }









    return null;


}









/* =====================================
   CONTEXT RESPONSE
===================================== */


function HalDoContextAnswer(input){



    const mood =

    HalDoMood(input);



    if(mood){


        return mood;


    }









    const text =

    input.toLowerCase();





    if(

        text.includes("vorhin") ||

        text.includes("vorher") ||

        text.includes("gesagt")

    ){


        if(

            HalDoConversation.context.length

        ){


            return (

                "Ich erinnere mich an unser Gespräch. " +

                "Wir arbeiten gerade an HalDo AI OS. 🚀"

            );


        }


    }









    if(

        text.includes("sprache") ||

        text.includes("sprechen")

    ){


        return (

            "Sprachsteuerung ist vorbereitet. " +

            "Die Stimme kann später erweitert werden. 🔊"

        );


    }









    return null;


}









/* =====================================
   VOICE PREPARATION
===================================== */


const HalDoVoice = {


    enabled:false,


    speak(text){


        if(

            !this.enabled

        )

        return;



        if(

            "speechSynthesis" in window

        ){


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









document.addEventListener(

"DOMContentLoaded",

()=>{


    HalDoConversation.load();


});