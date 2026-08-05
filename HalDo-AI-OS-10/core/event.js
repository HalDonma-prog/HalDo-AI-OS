/*
========================================
HalDo AI OS Professional Ultimate 16.0

Core Event System

========================================
*/


"use strict";


const HalDoEvents = {


    events: {},





    on(name, callback){



        if(!this.events[name]){


            this.events[name] = [];


        }





        this.events[name].push(

            callback

        );



    },








    emit(name, data = null){



        if(!this.events[name]){


            return;


        }






        this.events[name].forEach(

            callback => {


                try {


                    callback(data);


                }


                catch(error){



                    console.error(

                        "Event Fehler:",
                        error

                    );


                }



            }


        );



    },








    off(name){



        delete this.events[name];



    },








    list(){


        return this.events;


    }





};






window.HalDoEvents = HalDoEvents;