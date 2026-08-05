/*
========================================
HalDo AI OS Professional 16.0

Core System Engine

========================================
*/

"use strict";


const HalDoSystem = {



    status: "offline",


    modules: [],


    startTime: null,






    init(){



        if(window.HalDoLogger){


            HalDoLogger.info(

                "System Initialisierung gestartet"

            );


        }







        if(window.HalDoKernel){


            HalDoKernel.boot();


        }







        this.loadModules();




        this.status = "online";


        this.startTime = new Date();






        if(window.HalDoConfig){


            HalDoConfig.system.status =

            "online";


        }







        if(window.HalDoEvents){


            HalDoEvents.emit(

                "system-ready",

                this.info()

            );


        }







        this.updateScreen();





        return true;



    },









    loadModules(){



        this.modules = [



            "Configuration",

            "Logger",

            "Events",

            "Storage",

            "Kernel",

            "Router"



        ];







        this.modules.forEach(



            module => {



                if(window.HalDoKernel){



                    HalDoKernel.register(

                        module

                    );



                }



            }


        );



    },









    updateScreen(){



        const status =

        document.getElementById(

            "system-status"

        );






        if(status){



            status.innerHTML =

            "🟢 HalDo AI OS 16.0 Online";



            status.className =

            "status-box status-online";



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