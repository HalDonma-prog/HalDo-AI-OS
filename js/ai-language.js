/*
=====================================

HalDo AI OS 18
AI Language System

Professional Ultimate Foundation

Version 18.0.0

=====================================
*/


const HalDoLanguage = {


    current: "de",


    languages: {


        de: {

            name: "Deutsch",

            native: "Deutsch"

        },


        en: {

            name: "English",

            native: "English"

        },


        ku: {

            name: "Kurdî",

            native: "Kurmancî"

        },


        ez: {

            name: "Êzîkî",

            native: "Êzîkî"

        },


        tr: {

            name: "Türkçe",

            native: "Türkçe"

        },


        ar: {

            name: "العربية",

            native: "العربية"

        }


    },



    change(language){


        if(this.languages[language]){


            this.current = language;


            console.log(

                "🌍 Sprache geändert:",

                this.languages[language].name

            );


            return true;

        }


        console.warn(

            "Sprache nicht gefunden:",

            language

        );


        return false;


    },



    getCurrent(){


        return this.languages[this.current];


    },



    getAll(){


        return this.languages;


    }


};





window.HalDoLanguage = HalDoLanguage;




window.addEventListener(

"load",

()=>{


console.log(

"🌍 AI Language System bereit"

);


}

);