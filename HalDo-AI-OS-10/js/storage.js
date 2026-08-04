// ==========================================
// HalDo AI OS Professional 10.0
// Storage Core System
// ==========================================


"use strict";



const HalDoStorage = {



    prefix: "HalDoAI_",




    init: function(){


        console.log(
            "💾 Storage System gestartet"
        );


    },





    save: function(key, value){


        try{


            localStorage.setItem(

                this.prefix + key,

                JSON.stringify(value)

            );


            console.log(
                "💾 Gespeichert:",
                key
            );


        }

        catch(error){


            console.error(
                "❌ Speicherfehler:",
                error
            );


        }


    },







    load: function(key){


        try{


            const data = localStorage.getItem(

                this.prefix + key

            );



            if(data){


                return JSON.parse(data);


            }


            return null;


        }


        catch(error){


            console.error(
                "❌ Ladefehler:",
                error
            );


            return null;


        }


    },







    remove: function(key){


        localStorage.removeItem(

            this.prefix + key

        );


        console.log(
            "🗑️ Entfernt:",
            key
        );


    },







    clear: function(){


        Object.keys(localStorage)

        .filter(key => 

            key.startsWith(this.prefix)

        )

        .forEach(key =>

            localStorage.removeItem(key)

        );



        console.log(
            "🧹 HalDo Speicher gelöscht"
        );


    }





};






window.HalDoStorage = HalDoStorage;



console.log(
    "✅ Storage Core geladen"
);