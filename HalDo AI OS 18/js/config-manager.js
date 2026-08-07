/*
========================================

HalDo AI OS 18
Config Manager Foundation

Version:
18.0.0

System Configuration Layer

========================================
*/


const ConfigManager = {


    name:
    "HalDo Configuration Manager",


    version:
    "18.0.0",


    config:
    {},



    initialize(){


        console.log(
            "⚙️ Config Manager startet"
        );


        this.loadDefault();


        this.report();


    },



    loadDefault(){


        this.config = {


            system: {


                name:
                "HalDo AI OS",


                version:
                "18.0.0",


                mode:
                "foundation"



            },


            interface: {


                language:
                "de",


                theme:
                "default"



            },


            modules: {


                autoLoad:
                true


            },


            security: {


                enabled:
                true


            }


        };



        console.log(
            "⚙️ Standard-Konfiguration geladen"
        );


    },



    get(path){


        const parts =
        path.split(".");


        let value =
        this.config;



        for(
            const part of parts
        ){


            if(
                value[part]
                === undefined
            ){

                return null;

            }


            value =
            value[part];


        }



        return value;


    },



    set(path, value){


        const parts =
        path.split(".");


        let target =
        this.config;



        while(
            parts.length > 1
        ){


            const key =
            parts.shift();



            if(
                !target[key]
            ){

                target[key] = {};

            }



            target =
            target[key];


        }



        target[parts[0]]
        =
        value;



        console.log(
            "⚙️ Konfiguration geändert:",
            path
        );


    },



    getAll(){


        return this.config;


    },



    report(){


        console.log(
            "===================="
        );


        console.log(
            "⚙️",
            this.name
        );


        console.log(
            "Version:",
            this.version
        );


        console.log(
            this.config
        );


        console.log(
            "===================="
        );


    }


};





// Config starten

ConfigManager.initialize();