/*
========================================

HalDo AI OS 18
Memory Foundation

Version:
18.0.0

AI Memory Layer

========================================
*/


const Memory = {


    name:
    "HalDo Memory System",


    version:
    "18.0.0",


    status:
    "offline",


    storage:
    [],



    initialize(){


        console.log(
            "🧠 Memory System Initialisierung..."
        );


        this.status =
        "starting";


        this.start();


    },



    start(){


        this.status =
        "active";



        if(
            typeof Logger !== "undefined"
        ){

            Logger.info(
                "Memory System gestartet"
            );

        }



        if(
            typeof EventBus !== "undefined"
        ){

            EventBus.emit(
                "memory.ready",
                {

                    status:
                    this.status

                }

            );

        }



        console.log(
            "🧠 HalDo Memory bereit"
        );


    },



    save(
        key,
        value
    ){


        const item = {


            key:
            key,


            value:
            value,


            time:
            new Date()
            .toISOString()


        };



        this.storage.push(
            item
        );



        console.log(
            "🧠 Erinnerung gespeichert:",
            key
        );



        return item;


    },



    find(
        key
    ){


        return this.storage.filter(

            item =>
            item.key === key

        );


    },



    getLatest(){


        return this.storage[
            this.storage.length - 1
        ];


    },



    clear(){


        this.storage = [];



        console.log(
            "🧠 Memory gelöscht"
        );


    },



    getStatus(){


        return {


            name:
            this.name,


            version:
            this.version,


            status:
            this.status,


            memories:
            this.storage.length


        };


    }


};





// Memory starten

Memory.initialize();