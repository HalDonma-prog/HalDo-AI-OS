/*
========================================
HalDo AI OS Professional 10.0
Router System
Foundation Build
========================================
*/


"use strict";


const HalDoRouter = {



    currentPage: "home",




    routes: {},





    register(name, path){


        this.routes[name] = path;


        console.log(
            "🛣️ Route registriert:",
            name
        );


    },







    navigate(name){



        const page = this.routes[name];



        if(!page){


            console.error(

                "❌ Route nicht gefunden:",
                name

            );


            return;


        }




        this.currentPage = name;



        console.log(

            "➡️ Navigation zu:",
            page

        );



        window.location.href = page;



    },







    getCurrent(){


        return this.currentPage;


    }






};





window.HalDoRouter = HalDoRouter;