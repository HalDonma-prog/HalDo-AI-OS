/* =====================================
   HALDO AI OS
   SYSTEM MANAGER v2.1
   MODULE CONTROL CENTER
===================================== */


/*
   System Manager
*/


const HalDoSystemManager = {


    name:

    "HalDo System Manager",



    version:

    "2.1",



    status:

    "online",



    modules:{},





    /*
       Modul registrieren
    */

    registerModule(name, module){


        this.modules[name] = module;



        console.log(

            "⚙️ Modul verbunden:",

            name

        );


    },





    /*
       Modul abrufen
    */

    getModule(name){


        return this.modules[name];


    },





    /*
       System Status
    */

    statusReport(){


        return {


            system:

            this.name,


            version:

            this.version,


            status:

            this.status,


            modules:

            Object.keys(
                this.modules
            )


        };


    },





    /*
       System Start
    */

    start(){


        console.log(

            "🚀 HalDo System Manager gestartet"

        );



        return this.statusReport();


    }


};





/*
   Global verfügbar machen
*/


window.HalDoSystemManager =

HalDoSystemManager;





/*
   Verbindung mit altem Namen
   für Module
*/


window.HalDoSystem =

HalDoSystemManager;





console.log(

"⚙️ HalDo System Manager v2.1 READY"

);