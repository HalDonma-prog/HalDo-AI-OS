// ==========================================
// HalDo AI OS Professional 10.0
// Event Management Core
// ==========================================


"use strict";



const HalDoEvents = {



    listeners: {},





    init: function(){


        console.log(
            "⚡ Event System gestartet"
        );


    },







    on: function(eventName, callback){



        if(!this.listeners[eventName]){


            this.listeners[eventName] = [];


        }





        this.listeners[eventName].push(
            callback
        );



        console.log(
            "📌 Event registriert:",
            eventName
        );


    },








    emit: function(eventName, data){



        console.log(
            "📢 Event:",
            eventName
        );



        if(this.listeners[eventName]){


            this.listeners[eventName].forEach(
                function(callback){


                    callback(data);


                }
            );


        }



    }





};





window.HalDoEvents = HalDoEvents;


console.log(
    "✅ Event Core geladen"
);