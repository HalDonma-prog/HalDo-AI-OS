// ========================================
// HalDo AI OS 16
// Event System
// ========================================


const HalDoEvents = {


    events: {},


    on(name, callback){


        if(!this.events[name]){

            this.events[name] = [];

        }


        this.events[name].push(callback);


    },



    emit(name, data){


        if(this.events[name]){


            this.events[name].forEach(

                callback => callback(data)

            );


        }


    }


};



window.HalDoEvents = HalDoEvents;