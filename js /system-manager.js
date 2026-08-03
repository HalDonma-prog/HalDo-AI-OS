/* =====================================
   HalDo AI OS v3.0
   SYSTEM MANAGER v1.1
===================================== */


/*
    Zentrale Verwaltung von HalDo AI OS

    Aufgaben:
    - Systemstatus
    - Module verwalten
    - Version
    - Registrierung
    - Erweiterungen vorbereiten
*/



const HalDoSystem = {


    name:
    "HalDo AI OS",


    version:
    "3.0",


    managerVersion:
    "1.1",


    status:
    "online",


    modules:
    {},






    // ==========================
    // Modul registrieren
    // ==========================

    registerModule(name, module){


        if(!name){

            console.log(
                "⚠️ Modul ohne Namen"
            );

            return;

        }



        this.modules[name] = module;



        console.log(
            "📦 Modul registriert:",
            name
        );


    },







    // ==========================
    // Modul prüfen
    // ==========================

    hasModule(name){


        return this.modules[name]
        !== undefined;


    },







    // ==========================
    // Status abrufen
    // ==========================

    getStatus(){


        return {


            name:
            this.name,


            version:
            this.version,


            manager:
            this.managerVersion,


            status:
            this.status,


            modules:
            Object.keys(
                this.modules
            )


        };


    },







    // ==========================
    // System Start
    // ==========================

    start(){


        console.log(
            "🚀 HalDo System Manager gestartet"
        );



        console.log(
            this.getStatus()
        );


    }



};








// Global verfügbar machen


window.HalDoSystem =
HalDoSystem;








// Start


HalDoSystem.start();