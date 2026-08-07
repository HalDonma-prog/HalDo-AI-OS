/*
========================================

HalDo AI OS 18
Boot System

Version:
18.0.0

System Startup Controller

========================================
*/


const BootSystem = {


    name:
    "HalDo Boot System",


    version:
    "18.0.0",


    status:
    "offline",



    initialize(){


        console.log(
            "🚀 HalDo AI OS 18 Boot gestartet"
        );


        this.status =
        "starting";


        this.updateStatus(
            "🟡 HalDo AI OS 18 startet..."
        );


        this.startSequence();


    },



    startSequence(){


        setTimeout(() => {


            this.updateStatus(
                "🔵 Kernel wird geladen..."
            );


            this.startKernel();



        },500);



    },



    startKernel(){


        if(
            typeof KernelSystem !== "undefined"
        ){

            KernelSystem.initialize();


            this.status =
            "kernel-loaded";


            this.updateStatus(
                "🔵 Kernel geladen"
            );


        }
        else {


            console.warn(
                "Kernel nicht gefunden"
            );


        }



    },



    complete(){


        this.status =
        "ready";


        this.updateStatus(
            "🟢 HalDo AI OS 18 bereit"
        );


        console.log(
            "✅ Boot abgeschlossen"
        );


    },



    updateStatus(message){


        const element =
        document.getElementById(
            "system-status"
        );



        if(element){


            element.innerHTML =
            message;


        }



        console.log(
            message
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