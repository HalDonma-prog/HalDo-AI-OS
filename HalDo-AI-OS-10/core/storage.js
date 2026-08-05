/*
========================================
HalDo AI OS Professional 16.0
Ultimate Foundation

Core Storage System
========================================
*/


"use strict";


const HalDoStorage = {


    prefix: "HalDoAI_",





    save(key, value){



        try{


            const data =
            JSON.stringify(value);



            localStorage.setItem(

                this.prefix + key,

                data

            );



            if(window.HalDoLogger){


                HalDoLogger.success(

                    "Gespeichert: " + key

                );


            }



            return true;



        }

        catch(error){



            if(window.HalDoLogger){


                HalDoLogger.error(

                    error.message

                );


            }



            return false;


        }


    },







    load(key){



        try{


            const data =

            localStorage.getItem(

                this.prefix + key

            );




            if(!data){


                return null;


            }




            return JSON.parse(data);



        }

        catch(error){



            if(window.HalDoLogger){


                HalDoLogger.error(

                    error.message

                );


            }



            return null;


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



    },







    exists(key){



        return (

            localStorage.getItem(

                this.prefix + key

            ) !== null

        );



    }





};





window.HalDoStorage = HalDoStorage;