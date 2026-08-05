/*
========================================
HalDo AI OS Professional 16.0

Core Logger System

========================================
*/

"use strict";


const HalDoLogger = {


    logs: [],


    write(type, message){


        const entry = {

            type,

            message,

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

        return this.write(
            "INFO",
            message
        );

    },


    success(message){

        return this.write(
            "SUCCESS",
            message
        );

    },


    error(message){

        return this.write(
            "ERROR",
            message
        );

    },


    all(){

        return this.logs;

    }


};


window.HalDoLogger = HalDoLogger;