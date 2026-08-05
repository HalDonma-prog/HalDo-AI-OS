/*
========================================
HalDo AI OS Professional 16.0
Ultimate Foundation

Core Configuration System
========================================
*/


"use strict";


const HalDoConfig = {


    system: {

        name: "HalDo AI OS",

        version: "16.0.0",

        edition: "Professional Ultimate Foundation",

        status: "initializing"

    },



    developer: {

        project: "HalDo AI OS",

        build: "16.0",

        environment: "production"

    },



    user: {

        language: "de",

        theme: "dark"

    },



    features: {


        dashboard: true,

        chat: true,

        settings: true,

        storage: true,

        pwa: true,

        modules: true


    },




    get(key){


        return this[key];


    },





    info(){


        return {


            name:
            this.system.name,


            version:
            this.system.version,


            edition:
            this.system.edition,


            status:
            this.system.status


        };


    }





};





window.HalDoConfig = HalDoConfig;