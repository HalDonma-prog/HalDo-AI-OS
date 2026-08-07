/*
=====================================

HalDo AI OS 18
Language Manager

Professional Ultimate Foundation

Version 18.0.0

=====================================
*/


const HalDoLanguageManager = {


    languages: [],


    current: "de",





    load(){


        fetch(
        "data/languages.json"
        )


        .then(response => {


            return response.json();


        })


        .then(data => {


            this.languages =
            data.languages;



            console.log(
            "🌍 Sprachen geladen:",
            this.languages.length
            );



        })


        .catch(error => {


            console.error(

            "❌ Sprachdaten Fehler:",

            error

            );


        });



    },







    change(id){


        const language =

        this.languages.find(

            item => item.id === id

        );



        if(language){


            this.current =
            id;



            console.log(

            "🌍 Sprache geändert:",

            language.name

            );



            if(
            window.HalDoVoice
            ){


                HalDoVoice.setLanguage(

                    language.voice

                );


            }



            return language;


        }



        return null;


    },







    getCurrent(){


        return this.languages.find(

            item =>

            item.id === this.current

        );


    },







    getAll(){


        return this.languages;


    }




};








window.HalDoLanguageManager =
HalDoLanguageManager;







window.addEventListener(

"load",

()=>{


HalDoLanguageManager.load();



});