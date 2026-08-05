/*
========================================
HalDo AI OS Professional 10.0
Navigation Manager
Foundation Build
========================================
*/


"use strict";


const HalDoNavigation = {



    menu: {},




    register(name, path){


        this.menu[name] = path;



        console.log(

            "🧭 Navigation registriert:",

            name

        );


    },






    open(name){



        if(

            window.HalDoRouter

        ){



            HalDoRouter.navigate(name);



        }

        else {



            console.error(

                "❌ Router nicht verfügbar"

            );


        }



    },








    getMenu(){


        return this.menu;


    },







    init(){



        console.log(

            "✅ Navigation-System bereit"

        );



    }



};





window.HalDoNavigation = HalDoNavigation;