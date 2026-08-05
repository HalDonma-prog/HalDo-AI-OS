/*
========================================
HalDo AI OS Professional 16.0
Ultimate Foundation

Core System Engine
========================================
*/


"use strict";


const HalDoSystem = {



    status: "offline",



    modules: [],






    init(){



        console.log(
            "🤖 HalDo AI OS System Initialisierung..."
        );





        if(window.HalDoKernel){


            HalDoKernel.init();


        }






        this.loadModules();



        this.status = "online";





        if(window.HalDoLogger){


            HalDoLogger.success(

                "System erfolgreich gestartet"

            );


        }






        if(window.HalDoEvents){


            HalDoEvents.emit(

                "system-ready",

                this.info()

            );


        }






        this.updateScreen();



    },









    loadModules(){



        this.modules = [



            "Config",

            "Logger",

            "Kernel",

            "Events",

            "Storage",

            "Router"



        ];




        if(window.HalDoKernel){



            this.modules.forEach(

                module => {


                    HalDoKernel.register(

                        module

                    );


                }

            );



        }



    },









    updateScreen(){



        const status =

        document.getElementById(

            "system-status"

        );





        if(status){



            status.innerHTML =

            "🟢 HalDo AI OS 16.0 Online";



        }



    },









    info(){



        return {



            name:

            "HalDo AI OS",



            version:

            "16.0.0",



            status:

            this.status,



            modules:

            this.modules



        };



    }





};






window.HalDoSystem = HalDoSystem;