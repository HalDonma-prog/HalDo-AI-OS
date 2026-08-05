/*
========================================
HalDo AI OS Professional 10.0
Event Manager Core
Foundation Build
========================================
*/


"use strict";


const HalDoEvents = {


    events: {},




    on(eventName, callback){


        if(!this.events[eventName]){


            this.events[eventName] = [];


        }


        this.events[eventName].push(callback);



        console.log(

            "🔗 Event registriert:",
            eventName

        );


    },






    emit(eventName, data){



        console.log(

            "📢 Event:",
            eventName

        );



        if(this.events[eventName]){


            this.events[eventName].forEach(

                callback => {

                    callback(data);

                }

            );


        }


    },






    remove(eventName){


        delete this.events[eventName];



        console.log(

            "🗑️ Event entfernt:",
            eventName

        );


    },







    init(){


        console.log(

            "✅ Event-System bereit"

        );


    }



};





window.HalDoEvents = HalDoEvents;