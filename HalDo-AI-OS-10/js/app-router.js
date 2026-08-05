/*
========================================
HalDo AI OS Professional 16.0

Application Router System

========================================
*/


"use strict";


const HalDoAppRouter = {


    apps: {


        home: "index.html",


        dashboard:
        "apps/dashboard/index.html",


        chat:
        "apps/chat/index.html",


        settings:
        "apps/settings/index.html",


        languages:
        "apps/languages/index.html",


        profile:
        "apps/profile/index.html",


        library:
        "apps/library/index.html",


        tools:
        "apps/tools/index.html",


        security:
        "apps/security/index.html"


    },







    open(app){


        const page = this.apps[app];



        if(!page){


            console.error(

                "App nicht gefunden:",
                app

            );


            return;


        }




        console.log(

            "🚀 Öffne App:",
            app

        );





        window.location.href = page;



    },








    getApps(){


        return this.apps;


    }






};





window.HalDoAppRouter = HalDoAppRouter;