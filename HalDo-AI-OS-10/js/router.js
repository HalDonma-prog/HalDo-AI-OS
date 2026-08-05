// ==========================================
// HalDo AI OS Professional 10.0
// Router Core System
// ==========================================


"use strict";



const HalDoRouter = {



    routes: {},





    init: function(){


        console.log(
            "🧭 Router System gestartet"
        );


    },







    add: function(name, path){



        this.routes[name] = path;



        console.log(
            "📌 Route hinzugefügt:",
            name
        );


    },







    open: function(name){



        const page = this.routes[name];



        if(page){


            console.log(
                "➡️ Öffne:",
                page
            );


            window.location.href = page;


        }

        else{


            console.warn(
                "⚠️ Route nicht gefunden:",
                name
            );


        }


    },







    list: function(){


        return this.routes;


    }





};






window.HalDoRouter = HalDoRouter;



console.log(
    "✅ Router Core geladen"
);