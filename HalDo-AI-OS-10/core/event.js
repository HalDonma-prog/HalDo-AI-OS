// =====================================
// HalDo AI OS Event System
// =====================================


const HalDoEvents = {


    listeners:{},


    on(event, callback){

        if(!this.listeners[event]){

            this.listeners[event] = [];

        }


        this.listeners[event].push(callback);

    },



    emit(event,data){


        if(this.listeners[event]){


            this.listeners[event].forEach(

                callback => callback(data)

            );


        }


    }


};



window.HalDoEvents = HalDoEvents;