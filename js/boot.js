/*
========================================

HalDo AI OS 18
Boot System Foundation

Version:
18.0.0

System Startup Layer

========================================
*/


const BootSystem = {


    name:
    "HalDo Boot Manager",


    version:
    "18.0.0",


    status:
    "offline",



    initialize(){


        console.log(
            "🚀 Boot System Initialisierung..."
        );


        this.status =
        "starting";



        this.checkDependencies();



    },



    checkDependencies(){


        console.log(
            "🔎 Prüfe System-Abhängigkeiten..."
        );



        const dependencies = [


            "EventBus",


            "Logger",


            "ConfigManager"


        ];



        dependencies.forEach(
            dependency => {


                if(
                    typeof window[dependency]
                    !== "undefined"
                ){

                    console.log(
                        "🟢",
                        dependency,
                        "bereit"
                    );


                }
                else {


                    console.warn(
                        "🟡",
                        dependency,
                        "nicht gefunden"
                    );


                }


            }

        );



        this.start();



    },



    start(){


        this.status =
        "active";



        if(
            typeof Logger
            !== "undefined"
        ){

            Logger.info(
                "Boot System erfolgreich gestartet"
            );


        }



        if(
            typeof EventBus
            !== "undefined"
        ){

            EventBus.emit(
                "system.boot",
                {

                    status:
                    "active"

                }

            );


        }



        console.log(
            "🚀 HalDo AI OS 18 Boot abgeschlossen"
        );



    },



    getStatus(){


        return {


            name:
            this.name,


            version:
            this.version,


            status:
            this.status


        };


    }


};





// Boot starten

BootSystem.initialize();