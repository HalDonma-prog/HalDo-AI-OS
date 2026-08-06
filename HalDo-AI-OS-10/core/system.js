// ========================================
// HalDo AI OS 16
// System Manager
// ========================================


const HalDoSystem = {


    start(){


        console.log(

            "HalDo AI OS System startet..."

        );



        if(window.HalDoConfig){


            HalDoConfig.system.status = "running";


        }



        if(window.HalDoEvents){


            HalDoEvents.emit(

                "system-ready",

                {

                    version:

                    HalDoConfig.version

                }

            );


        }



        const status = document.getElementById(

            "system-message"

        );



        if(status){


            status.innerHTML =

            "🟢 System bereit";


        }



    },



    info(){


        return {


            name:

            HalDoConfig.name,


            version:

            HalDoConfig.version


        };


    }



};



window.HalDoSystem = HalDoSystem;