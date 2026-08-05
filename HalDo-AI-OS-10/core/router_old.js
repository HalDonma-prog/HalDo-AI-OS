/*
========================================
HalDo AI OS Professional 10.0
Router Core
Foundation Build
========================================
*/


"use strict";


const HalDoRouter = {



    routes: {},





    register(name, path){


        this.routes[name] = path;



        console.log(

            "🧭 Route registriert:",

            name

        );


    },







    navigate(name){



        const path =

        this.routes[name];



        if(path){



            window.location.href = path;



        }

        else {



            console.error(

                "❌ Route nicht gefunden:",

                name

            );


        }



    },







    getRoutes(){



        return this.routes;



    },







    init(){


        console.log(

            "✅ Router-System bereit"

        );


    }



};





window.HalDoRouter = HalDoRouter;