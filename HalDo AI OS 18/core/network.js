/*
========================================

HalDo AI OS 18
Network Foundation

Version:
18.0.0

System Network Layer

========================================
*/


const Network = {


    name:
    "HalDo Network System",


    version:
    "18.0.0",


    status:
    "offline",


    connection:
    {

        online:
        false,


        type:
        "none"


    },



    initialize(){


        console.log(
            "🌐 Network Initialisierung..."
        );


        this.status =
        "starting";


        this.start();


    },



    start(){


        this.status =
        "active";



        this.detect();



        if(
            typeof Logger !== "undefined"
        ){

            Logger.info(
                "Network System gestartet"
            );

        }



        if(
            typeof EventBus !== "undefined"
        ){

            EventBus.emit(
                "network.ready",
                {

                    status:
                    this.status

                }

            );

        }



        console.log(
            "🌐 HalDo Network bereit"
        );


    },



    detect(){


        if(
            navigator.onLine
        ){

            this.connection.online =
            true;


            this.connection.type =
            "online";


        }
        else {


            this.connection.online =
            false;


            this.connection.type =
            "offline";


        }



        return this.connection;


    },



    connect(){


        this.connection.online =
        true;


        this.connection.type =
        "connected";



        console.log(
            "🌐 Verbindung hergestellt"
        );


    },



    disconnect(){


        this.connection.online =
        false;


        this.connection.type =
        "disconnected";



        console.log(
            "🌐 Verbindung getrennt"
        );


    },



    getConnection(){


        return this.connection;


    },



    getStatus(){


        return {


            name:
            this.name,


            version:
            this.version,


            status:
            this.status,


            connection:
            this.connection


        };


    }


};





// Network starten

Network.initialize();