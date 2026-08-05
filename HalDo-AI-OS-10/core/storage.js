/*
========================================
HalDo AI OS Professional 10.0
Storage Core
Foundation Build
========================================
*/


"use strict";


const HalDoStorage = {



    prefix: "HalDo_",




    save(key, value){



        try {


            localStorage.setItem(

                this.prefix + key,

                JSON.stringify(value)

            );



            console.log(

                "💾 Gespeichert:",
                key

            );



            return true;



        } catch(error){



            console.error(

                "❌ Speicherfehler:",
                error

            );


            return false;


        }



    },







    load(key){



        try {



            const data =

            localStorage.getItem(

                this.prefix + key

            );



            if(!data){


                return null;


            }



            return JSON.parse(data);



        } catch(error){



            console.error(

                "❌ Ladefehler:",
                error

            );



            return null;


        }


    },








    remove(key){



        localStorage.removeItem(

            this.prefix + key

        );



        console.log(

            "🗑️ Entfernt:",
            key

        );



    },








    clear(){



        Object.keys(localStorage)

        .filter(

            key =>

            key.startsWith(this.prefix)

        )

        .forEach(

            key =>

            localStorage.removeItem(key)

        );



        console.log(

            "🧹 HalDo Speicher gelöscht"

        );



    },







    init(){


        console.log(

            "✅ Storage-System bereit"

        );


    }



};





window.HalDoStorage = HalDoStorage;