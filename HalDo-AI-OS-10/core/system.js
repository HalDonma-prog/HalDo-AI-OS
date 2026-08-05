/*
========================================
HalDo AI OS Professional Ultimate 16.0

Core System Engine

========================================
*/


"use strict";


const HalDoSystem = {


    status: "offline",


    modules: [],


    startTime: null,







    async init(){



        console.log(

            "🤖 HalDo AI OS startet..."

        );






        this.startTime =

        new Date();







        if(window.HalDoKernel){



            HalDoKernel.init();



        }







        if(window.HalDoLanguage){



            await HalDoLanguage.init();



        }








        this.loadCoreModules();






        this.status = "online";







        if(window.HalDoLogger){



            HalDoLogger.success(

                "HalDo AI OS erfolgreich gestartet"

            );



        }








        if(window.HalDoEvents){



            HalDoEvents.emit(

                "system-ready",

                this.info()

            );



        }






        this.updateStatus();





    },









    loadCoreModules(){



        this.modules = [



            "Config",


            "Logger",


            "Events",


            "Storage",


            "Kernel",


            "Router",


            "Language"



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









    updateStatus(){



        const element =

        document.getElementById(

            "system-status"

        );






        if(element){



            element.innerHTML =

            "🟢 HalDo AI OS 16.0 Online";



            element.className =

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

            this.modules,



            startTime:

            this.startTime



        };



    }






};






window.HalDoSystem = HalDoSystem;