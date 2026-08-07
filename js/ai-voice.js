/*
=====================================

HalDo AI OS 18
AI Voice System

Professional Ultimate Foundation

Version 18.0.0

=====================================
*/


const HalDoVoice = {


    enabled: true,


    voice: null,


    language: "de-DE",



    init(){


        if(
            "speechSynthesis" in window
        ){


            console.log(
            "🔊 Sprachsystem verfügbar"
            );


            this.loadVoices();


        }


        else{


            console.warn(
            "🔇 Sprache wird nicht unterstützt"
            );


        }


    },





    loadVoices(){


        const voices =
        speechSynthesis.getVoices();



        if(voices.length > 0){


            this.voice =
            voices[0];


        }


    },







    setLanguage(lang){


        this.language = lang;



        console.log(

            "🌍 Stimme geändert:",

            lang

        );


    },







    speak(text){


        if(
            !this.enabled
        ){

            return;

        }



        const speech =
        new SpeechSynthesisUtterance(
            text
        );



        speech.lang =
        this.language;



        if(this.voice){


            speech.voice =
            this.voice;


        }



        speech.rate =
        1;



        speech.pitch =
        1;



        window.speechSynthesis
        .speak(
            speech
        );



        console.log(
        "🔊 HalDo spricht:",
        text
        );


    }







};





window.HalDoVoice =
HalDoVoice;







window.addEventListener(

"load",

()=>{


HalDoVoice.init();



}

);