/* =====================================
   HalDo AI OS v3.0
   AI CORE v1.2 SYSTEM CONNECTED
===================================== */


/*
    HalDo AI Core

    Zentrale Intelligenz von HalDo AI OS

    Aufgaben:
    - Benutzerverwaltung
    - Sprache
    - Erinnerungen
    - Module
    - System Manager Verbindung
*/



const HalDoAI = {


    systemName:
    "HalDo AI OS",


    version:
    "3.0",


    coreVersion:
    "1.2",


    status:
    "online",






    user:{


        name:
        "User",


        language:
        "de",


        preferences:{}


    },






    memory: [],






    modules:{


        chat:
        false,


        files:
        false,


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
    // SYSTEM START
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





        // Verbindung System Manager


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
                "⚠️ System Manager nicht geladen"
            );


        }



    },









    // =========================
    // SPRACHE
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
    // MEMORY
    // =========================


    remember(data){



        this.memory.push(data);



        console.log(

            "🧠 Erinnerung gespeichert:",

            data

        );



    },









    // =========================
    // MODUL AKTIVIEREN
    // =========================


    enableModule(name){



        if(

            this.modules[name]

            !==

            undefined

        ){


            this.modules[name] =
            true;



            console.log(

                "📱 Modul aktiviert:",

                name

            );



        }else{


            console.log(

                "⚠️ Modul nicht vorhanden:",

                name

            );


        }



    },









    // =========================
    // STATUS
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









// Start


HalDoAI.start();