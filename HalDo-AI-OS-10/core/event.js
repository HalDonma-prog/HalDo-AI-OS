/*
========================================
HalDo AI OS Professional 10.0
Event Manager
Foundation Build
========================================
*/


"use strict";


const HalDoEvents = {


    events: {},





    on(name, callback){


        if(!this.events[name]){


            this.events[name] = [];


        }



        this.events[name].push(callback);



        console.log(

            "📡 Event registriert:",
            name

        );


    },







    emit(name, data = null){



        const listeners =

        this.events[name];



        if(!listeners){


            return;


        }




        listeners.forEach(

            callback => {

                callback(data);

            }

        );



        console.log(

            "📨 Event gesendet:",
            name

        );



    },







    remove(name){



        delete this.events[name];



    }




};





window.HalDoEvents = HalDoEvents;