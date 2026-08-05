/*
========================================
HalDo AI OS Professional 16.0
Ultimate Foundation

Core Logger System
========================================
*/


"use strict";


const HalDoLogger = {


    logs: [],



    add(type, message){


        const entry = {


            type: type,

            message: message,

            time: new Date().toISOString()


        };



        this.logs.push(entry);



        console.log(

            `[${type}]`,
            message

        );


        return entry;


    },





    info(message){


        return this.add(

            "INFO",

            message

        );


    },





    success(message){


        return this.add(

            "SUCCESS",

            message

        );


    },





    warning(message){


        return this.add(

            "WARNING",

            message

        );


    },





    error(message){


        return this.add(

            "ERROR",

            message

        );


    },





    all(){


        return this.logs;


    },





    clear(){


        this.logs = [];


    }





};





window.HalDoLogger = HalDoLogger;