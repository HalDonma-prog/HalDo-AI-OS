/*
========================================
HalDo AI OS Professional 16.0

Core Configuration System

========================================
*/

"use strict";


const HalDoConfig = {

    system: {

        name: "HalDo AI OS",

        version: "16.0.0",

        edition: "Professional Ultimate Foundation",

        status: "starting"

    },


    settings: {

        language: "de",

        theme: "dark"

    },


    features: {

        dashboard: true,

        chat: true,

        settings: true,

        storage: true,

        modules: true,

        pwa: true

    },


    info(){

        return {

            name: this.system.name,

            version: this.system.version,

            edition: this.system.edition,

            status: this.system.status

        };

    }


};


window.HalDoConfig = HalDoConfig;