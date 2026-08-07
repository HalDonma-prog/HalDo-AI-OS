/*
========================================

HalDo AI OS 18
Network Foundation

Version:
18.0.0

System Network Layer

========================================
*/


const NetworkSystem = {


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
        "unknown"


    },



    initialize(){


        console.log(
            "🌐 Network System startet..."
        );


        this.status =
        "starting";


        this.checkConnection();


    },



    checkConnection(){


        this.connection.online =
        navigator.onLine;



        if(
            this.connection.online
        ){


            this.connection.type =
            "online";


            this.status =
            "active";


        }
        else {


            this.connection.type =
            "offline";


            this.status =
            "standby";


        }



        console.log(
            "🌐 Netzwerk:",
            this.connection
        );


    },



    connect(){


        console.log(
            "🔗 Netzwerk Verbindung wird hergestellt..."
        );



        this.status =
        "connecting";


    },



    disconnect(){


        console.log(
            "🔌 Netzwerk getrennt"
        );



        this.status =
        "offline";


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





// Netzwerk starten

NetworkSystem.initialize();



console.log(
    "🌐 HalDo Network geladen"
);