/*
=====================================

HalDo AI OS 18
AI Speech Recognition

Professional Ultimate Foundation

Version 18.0.0

=====================================
*/


const HalDoSpeech = {


    recognition:null,


    language:"de-DE",





    init(){



        const SpeechRecognition =

        window.SpeechRecognition ||

        window.webkitSpeechRecognition;





        if(!SpeechRecognition){


            console.warn(

            "🎤 Sprachsteuerung nicht verfügbar"

            );


            return;


        }







        this.recognition =

        new SpeechRecognition();





        this.recognition.lang =

        this.language;





        this.recognition.continuous = false;





        this.recognition.interimResults = false;







        this.recognition.onresult =

        (event)=>{



            const text =

            event.results[0][0].transcript;



            console.log(

            "🎤 Gesprochen:",

            text

            );





            if(window.HalDoChat){


                const answer =

                HalDoChat.send(

                    text

                );


                console.log(

                answer

                );


            }



        };







        this.recognition.onerror =

        (error)=>{


            console.error(

            "🎤 Sprachfehler:",

            error

            );


        };






        console.log(

        "🎤 Sprachsystem bereit"

        );


    },







    start(){


        if(this.recognition){


            this.recognition.start();



            console.log(

            "🎤 Höre zu..."

            );


        }


    },







    setLanguage(lang){


        this.language = lang;



        if(this.recognition){


            this.recognition.lang = lang;


        }



    }



};







window.HalDoSpeech =
HalDoSpeech;







window.addEventListener(

"load",

()=>{


HalDoSpeech.init();



});