/*
========================================
HalDo AI OS Professional 16.0

Language Management System

========================================
*/

"use strict";


const HalDoLanguage = {


    current: "de",


    languages: [],




    async load(){


        try {


            const response = await fetch(
                "data/languages.json"
            );


            const data = await response.json();


            this.languages = data.available;


            this.current = data.default;



            console.log(
                "🌍 Sprachen geladen:",
                this.languages
            );


        }

        catch(error){


            console.error(
                "Language System Fehler:",
                error
            );


        }


    },






    setLanguage(code){


        const exists = this.languages.find(

            lang => lang.code === code

        );



        if(!exists){


            return false;


        }





        this.current = code;



        localStorage.setItem(

            "HalDo_language",

            code

        );



        return true;


    },







    getLanguage(){


        return this.current;


    },







    getAvailable(){


        return this.languages;


    }






};





window.HalDoLanguage = HalDoLanguage;