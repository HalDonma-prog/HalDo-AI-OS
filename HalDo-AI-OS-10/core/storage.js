/*
========================================
HalDo AI OS Professional Ultimate 16.0

Core Storage System

========================================
*/


"use strict";


const HalDoStorage = {


    prefix:

    "HalDo_",





    save(key, value){


        try {



            localStorage.setItem(


                this.prefix + key,


                JSON.stringify(value)



            );





            if(window.HalDoLogger){


                HalDoLogger.success(

                    "Gespeichert: " + key

                );


            }




            return true;



        }

        catch(error){


            console.error(

                "Storage Fehler:",
                error

            );


            return false;


        }



    },









    load(key, defaultValue = null){



        try {



            const data =

            localStorage.getItem(

                this.prefix + key

            );






            if(data === null){


                return defaultValue;


            }





            return JSON.parse(data);





        }

        catch(error){



            console.error(

                "Storage Ladefehler:",
                error

            );



            return defaultValue;


        }



    },









    remove(key){



        localStorage.removeItem(

            this.prefix + key

        );



    },








    clear(){



        Object.keys(

            localStorage

        )

        .forEach(key => {



            if(

                key.startsWith(

                    this.prefix

                )

            ){


                localStorage.removeItem(

                    key

                );


            }



        });



    }






};






window.HalDoStorage = HalDoStorage;