/*
========================================
HalDo AI OS Professional 16.0

Core Event Manager

========================================
*/

"use strict";


const HalDoEvents = {


    listeners: {},



    on(event, callback){


        if(!this.listeners[event]){


            this.listeners[event] = [];


        }



        this.listeners[event].push(callback);



        if(window.HalDoLogger){


            HalDoLogger.info(

                "Event registriert: " + event

            );


        }


    },






    emit(event, data = null){



        const callbacks =

        this.listeners[event];





        if(!callbacks){


            return;


        }






        callbacks.forEach(

            callback => {


                try {


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

                "Event gesendet: " + event

            );


        }



    },






    remove(event){



        delete this.listeners[event];



    },






    clear(){



        this.listeners = {};



    }





};





window.HalDoEvents = HalDoEvents;