/*
========================================
HalDo AI OS Professional Ultimate 16.0

Core Configuration System

========================================
*/

"use strict";


const HalDoConfig = {


    system: {


        name: "HalDo AI OS",


        version: "16.0.0",


        edition:
        "Professional Ultimate",


        status:
        "initializing"



    },





    developer: {


        project:
        "HalDo AI OS",


        build:
        "16.0 Ultimate",


        environment:
        "production"



    },





    user: {


        language:
        "de",


        theme:
        "dark"



    },





    features: {


        dashboard: true,


        chat: true,


        voice: true,


        languages: true,


        modules: true,


        storage: true,


        security: true,


        pwa: true



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