/*
========================================
HalDo AI OS Professional Ultimate 16.0

Language Management System

========================================
*/


"use strict";


const HalDoLanguage = {


    current: "de",


    languages: [],


    translations: {},







    async init(){



        await this.loadLanguages();



        this.loadSavedLanguage();



        console.log(

            "🌍 Language System bereit:",

            this.current

        );



    },









    async loadLanguages(){



        try {



            const response =

            await fetch(

                "data/languages.json"

            );






            const data =

            await response.json();






            this.languages =

            data.available;






            this.current =

            data.default;






        }



        catch(error){



            console.error(

                "Sprachen konnten nicht geladen werden:",

                error

            );



        }



    },









    setLanguage(code){



        const language =

        this.languages.find(

            item => item.code === code

        );






        if(!language){



            return false;



        }






        this.current = code;






        localStorage.setItem(

            "HalDo_language",

            code

        );






        if(window.HalDoEvents){



            HalDoEvents.emit(

                "language-change",

                code

            );



        }






        return true;



    },









    loadSavedLanguage(){



        const saved =

        localStorage.getItem(

            "HalDo_language"

        );





        if(saved){



            this.current = saved;



        }



    },









    getCurrent(){



        return this.current;



    },









    getLanguages(){



        return this.languages;



    }






};






window.HalDoLanguage = HalDoLanguage;