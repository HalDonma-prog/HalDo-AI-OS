/* =====================================
   HalDo AI OS v3.0
   FILE SYSTEM v1.1 CONNECTED
===================================== */


/*
    HalDo Files Modul

    Verbindung:
    Files ↔ AI Core ↔ System Manager

    Vorbereitung:
    - Dateien
    - Dokumente
    - Bilder
    - Musik
    - Videos
    - Cloud
    - Security
*/






// ================================
// Verbindung prüfen
// ================================


if(window.HalDoAI){


    console.log(
        "🧠 Files mit AI Core verbunden"
    );


}else{


    console.log(
        "⚠️ AI Core nicht gefunden"
    );


}









// ================================
// HalDo Files Modul
// ================================


const HalDoFiles = {



    name:
    "Files",


    version:
    "1.1",



    files: [],







    // Datei hinzufügen

    addFile(file){



        if(!file){


            console.log(
                "⚠️ Keine Datei angegeben"
            );


            return;


        }





        this.files.push(file);





        console.log(

            "📁 Datei hinzugefügt:",

            file

        );




    },









    // Suche

    search(text){



        if(!text){


            return this.files;


        }





        return this.files.filter(


            file =>


            file

            .toLowerCase()

            .includes(

                text.toLowerCase()

            )


        );



    },









    // Kategorien


    categories:{


        documents:
        "📄 Dokumente",


        images:
        "🖼 Bilder",


        music:
        "🎵 Musik",


        videos:
        "🎬 Videos",


        cloud:
        "☁ Cloud"



    },









    // Status


    getStatus(){


        return {


            name:
            this.name,


            version:
            this.version,


            count:
            this.files.length



        };


    },









    // Start


    start(){


        console.log(

            "📁 HalDo Files System gestartet"

        );



        console.log(

            this.getStatus()

        );


    }



};









// Global verfügbar machen


window.HalDoFiles =
HalDoFiles;









// Registrierung beim System Manager


if(window.HalDoSystem){



    HalDoSystem.registerModule(

        "Files",

        HalDoFiles

    );



    console.log(

        "⚙️ Files beim System Manager registriert"

    );



}









// Start


HalDoFiles.start();