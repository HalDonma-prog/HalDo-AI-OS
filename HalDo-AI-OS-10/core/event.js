/*
========================================
HalDo AI OS Professional 16.0
Ultimate Foundation

Core Event Manager
========================================
*/


"use strict";


const HalDoEvents = {


    events: {},





    on(name, callback){



        if(
            typeof callback !== "function"
        ){


            console.error(
                "Event Callback ungültig:",
                name
            );


            return;


        }





        if(
            !this.events[name]
        ){


            this.events[name] = [];


        }





        this.events[name].push(callback);



        if(window.HalDoLogger){


            HalDoLogger.info(
                "Event registriert: "
                + name
            );


        }



    },







    emit(name, data = null){



        const listeners =
        this.events[name];




        if(!listeners){


            return;


        }






        listeners.forEach(
            callback => {


                try{


                    callback(data);


                }
                catch(error){



                    if(window.HalDoLogger){


                        HalDoLogger.error(
                            error.message
                        );


                    }


                }


            }
        );






        if(window.HalDoLogger){


            HalDoLogger.info(
                "Event ausgelöst: "
                + name
            );


        }



    },







    remove(name){


        delete this.events[name];



    },







    clear(){


        this.events = {};



    }





};





window.HalDoEvents = HalDoEvents;