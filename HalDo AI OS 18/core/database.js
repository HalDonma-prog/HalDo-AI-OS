/*
========================================

HalDo AI OS 18
Database Foundation

Version:
18.0.0

System Data Layer

========================================
*/


const Database = {


    name:
    "HalDo Database System",


    version:
    "18.0.0",


    status:
    "offline",


    data:
    {},



    initialize(){


        console.log(
            "🗄️ Database Initialisierung..."
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
                "Database System gestartet"
            );

        }



        if(
            typeof EventBus !== "undefined"
        ){

            EventBus.emit(
                "database.ready",
                {

                    status:
                    this.status

                }

            );

        }



        console.log(
            "🗄️ HalDo Database bereit"
        );


    },



    set(
        key,
        value
    ){


        this.data[key]
        =
        value;



        console.log(
            "🗄️ Daten gespeichert:",
            key
        );



        return true;


    },



    get(
        key
    ){


        return this.data[key];


    },



    remove(
        key
    ){


        delete this.data[key];



        console.log(
            "🗄️ Daten entfernt:",
            key
        );


    },



    getAll(){


        return this.data;


    },



    clear(){


        this.data = {};



        console.log(
            "🗄️ Datenbank geleert"
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


            entries:
            Object.keys(
                this.data
            ).length


        };


    }


};





// Database starten

Database.initialize();