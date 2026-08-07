/*
========================================

HalDo AI OS 18
Event Bus Foundation

Version:
18.0.0

System Communication Layer

========================================
*/


const EventBus = {


    name:
    "HalDo Event Bus",


    version:
    "18.0.0",


    events:
    {},



    initialize(){


        console.log(
            "📡 Event Bus gestartet"
        );


    },



    on(event, callback){


        if(
            !this.events[event]
        ){

            this.events[event] = [];

        }



        this.events[event].push(
            callback
        );


        console.log(
            "📡 Listener registriert:",
            event
        );


    },



    emit(event, data = null){


        console.log(
            "📡 Event:",
            event,
            data
        );



        if(
            !this.events[event]
        ){

            return;

        }



        this.events[event]
        .forEach(callback => {


            try {


                callback(data);


            }
            catch(error){


                console.error(
                    "Event Fehler:",
                    error
                );


            }


        });


    },



    remove(event){


        if(
            this.events[event]
        ){

            delete this.events[event];


        }


    },



    getStatus(){


        return {


            name:
            this.name,


            version:
            this.version,


            events:
            Object.keys(
                this.events
            )


        };


    }


};





// Event System starten

EventBus.initialize();