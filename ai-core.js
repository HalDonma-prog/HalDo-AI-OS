/* =====================================
   HalDo AI OS
   AI CORE v1.1 SYSTEM CONNECTED
===================================== */


/*
    HalDo AI Core

    Zentrale Verwaltung für:

    - Benutzer
    - Sprache
    - Einstellungen
    - Module
    - Erinnerungen
    - System Manager Verbindung

*/



const HalDoAI = {


    systemName:
    "HalDo AI OS",


    version:
    "3.0",


    coreVersion:
    "1.1",


    status:
    "online",





    user: {


        name:
        "User",


        language:
        "de",


        preferences:
        {}


    },





    memory:
    [],





    modules: {


        chat:
        true,


        files:
        true,


        music:
        false,


        video:
        false,


        image:
        false,


        navigation:
        false,


        learning:
        false,


        store:
        false,


        cloud:
        false,


        security:
        true


    },






    // =========================
    // Start System
    // =========================


    start(){


        console.log(
            "🤖 HalDo AI Core gestartet"
        );


        console.log(
            this.systemName,
            "Core",
            this.coreVersion
        );




        // Verbindung mit System Manager


        if(window.HalDoSystem){


            HalDoSystem.registerModule(

                "AI Core",

                this

            );



            console.log(
                "⚙️ AI Core mit System Manager verbunden"
            );



        }else{


            console.log(
                "⚠️ System Manager nicht gefunden"
            );


        }


    },







    // =========================
    // Sprache
    // =========================


    setLanguage(lang){


        this.user.language =
        lang;



        console.log(

            "🌍 Sprache geändert:",

            lang

        );


    },








    // =========================
    // Erinnerung speichern
    // =========================


    remember(data){


        this.memory.push(
            data
        );



        console.log(

            "🧠 Erinnerung gespeichert:",

            data

        );


    },








    // =========================
    // Modul aktivieren
    // =========================


    enableModule(module){



        if(

            this.modules[module]

            !==

            undefined

        ){


            this.modules[module]
            =
            true;



            console.log(

                "📱 Modul aktiviert:",

                module

            );


        }else{


            console.log(

                "⚠️ Modul nicht gefunden:",

                module

            );


        }


    },








    // =========================
    // System Status
    // =========================


    getStatus(){



        return {


            name:
            this.systemName,


            version:
            this.version,


            core:
            this.coreVersion,


            status:
            this.status,


            modules:
            this.modules



        };


    }



};








// Global verfügbar machen


window.HalDoAI =
HalDoAI;








// System starten


HalDoAI.start();