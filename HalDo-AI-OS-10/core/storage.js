/*
========================================
HalDo AI OS Professional 16.0

Core Storage System

========================================
*/

"use strict";


const HalDoStorage = {



    prefix: "HalDoAI_",






    save(key, value){


        try {



            localStorage.setItem(

                this.prefix + key,

                JSON.stringify(value)

            );




            if(window.HalDoLogger){


                HalDoLogger.info(

                    "Gespeichert: " + key

                );


            }



            return true;



        }


        catch(error){



            if(window.HalDoLogger){


                HalDoLogger.error(

                    "Speicher Fehler: " +

                    error.message

                );


            }



            return false;



        }


    },









    get(key, defaultValue = null){



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

        .forEach(

            key => {



                if(

                    key.startsWith(

                        this.prefix

                    )

                ){


                    localStorage.removeItem(

                        key

                    );


                }


            }

        );



    },









    has(key){



        return (

            localStorage.getItem(

                this.prefix + key

            ) !== null

        );


    }





};





window.HalDoStorage = HalDoStorage;