/*
========================================

HalDo AI OS 18
Logger Foundation

Version:
18.0.0

System Logging Layer

========================================
*/


const Logger = {


    name:
    "HalDo System Logger",


    version:
    "18.0.0",


    logs:
    [],



    initialize(){


        console.log(
            "📝 Logger gestartet"
        );


        this.info(
            "Logger System bereit"
        );


    },



    createLog(type, message){


        const entry = {


            type:
            type,


            message:
            message,


            time:
            new Date()
            .toISOString()


        };



        this.logs.push(
            entry
        );



        return entry;


    },



    info(message){


        const log =
        this.createLog(
            "INFO",
            message
        );



        console.log(
            "🟢 INFO:",
            message
        );



        return log;


    },



    warn(message){


        const log =
        this.createLog(
            "WARNING",
            message
        );



        console.warn(
            "🟡 WARNING:",
            message
        );



        return log;


    },



    error(message){


        const log =
        this.createLog(
            "ERROR",
            message
        );



        console.error(
            "🔴 ERROR:",
            message
        );



        return log;


    },



    getLogs(){


        return this.logs;


    },



    clear(){


        this.logs = [];



        console.log(
            "📝 Logs gelöscht"
        );


    },



    getStatus(){


        return {


            name:
            this.name,


            version:
            this.version,


            entries:
            this.logs.length


        };


    }


};





// Logger starten

Logger.initialize();