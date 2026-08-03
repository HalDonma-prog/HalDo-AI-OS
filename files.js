/* =====================================
   HalDo AI OS v3.0
   FILE SYSTEM CONTROL
===================================== */


/*
    HalDo Files

    Vorbereitung für:
    - Dateien
    - Dokumente
    - Bilder
    - Musik
    - Videos
    - Cloud
    - Security
*/



// Verbindung mit AI Core prüfen

if(window.HalDoAI){

    console.log(
        "🧠 Files verbunden mit HalDo AI Core"
    );

}else{

    console.log(
        "⚠️ AI Core nicht gefunden"
    );

}





const HalDoFiles = {


    version:
    "3.0",



    files: [],



    // ==========================
    // Datei hinzufügen
    // ==========================


    addFile(file){


        this.files.push(file);


        console.log(
            "📁 Datei hinzugefügt:",
            file
        );


    },





    // ==========================
    // Suche vorbereiten
    // ==========================


    search(text){


        return this.files.filter(

            file =>

            file
            .toLowerCase()
            .includes(
                text.toLowerCase()
            )

        );


    },





    // ==========================
    // Kategorien
    // ==========================


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





    // ==========================
    // Start
    // ==========================


    start(){


        console.log(
            "📁 HalDo Files System gestartet"
        );


        console.log(
            "Version:",
            this.version
        );


    }


};





// Global verfügbar machen

window.HalDoFiles =
HalDoFiles;



// System starten

HalDoFiles.start();