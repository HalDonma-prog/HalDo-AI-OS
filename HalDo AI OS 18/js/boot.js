/*
========================================

HalDo AI OS 18
Boot System

Version:
18.0.0

Start Loader

========================================
*/


const HalDoBoot = {


    version: "18.0.0",


    status: "initializing",



    start(){


        console.log(
            "🚀 HalDo AI OS 18 Boot gestartet"
        );


        this.updateScreen(
            "🔵 Boot System wird geladen..."
        );


        this.status =
        "running";


        this.prepareKernel();


    },



    prepareKernel(){


        console.log(
            "🔵 Vorbereitung Kernel..."
        );


        this.updateScreen(
            "🔵 Kernel Vorbereitung läuft..."
        );


    },



    updateScreen(message){


        const status =
        document.getElementById(
            "status"
        );



        if(status){


            status.innerHTML =
            message;


        }


    },



    getStatus(){


        return {


            system:
            "HalDo AI OS 18",


            version:
            this.version,


            boot:
            this.status


        };


    }


};





// Start Boot System

HalDoBoot.start();