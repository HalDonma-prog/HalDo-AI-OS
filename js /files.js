/* =====================================
   HALDO AI OS
   FILES MODULE v2.1
   FILE MANAGEMENT SYSTEM
===================================== */


/*
   HalDo Files Modul
*/


const HalDoFiles = {


    name:

    "HalDo Files",



    version:

    "2.1",



    files: [],





    /*
       Datei hinzufügen
    */

    addFile(file){


        if(!file){

            console.log(
                "⚠️ Keine Datei vorhanden"
            );

            return;

        }



        this.files.push(file);



        console.log(

            "📁 Datei hinzugefügt:",

            file

        );


        this.save();


    },





    /*
       Alle Dateien anzeigen
    */

    list(){


        return this.files;


    },





    /*
       Suche
    */

    search(text){


        if(!text){

            return this.files;

        }



        return this.files.filter(

            file =>

            file.name

            .toLowerCase()

            .includes(

                text.toLowerCase()

            )

        );


    },





    /*
       Speichern
    */

    save(){


        if(window.HalDoStorage){


            HalDoStorage.save(

                "files",

                this.files

            );


        }


    },





    /*
       Laden
    */

    load(){


        if(window.HalDoStorage){


            this.files =

            HalDoStorage.load(
                "files"
            )
            ||
            [];

        }


    },





    /*
       Start
    */

    start(){


        this.load();



        console.log(

            "📁 HalDo Files gestartet",

            this.files

        );


    }


};





/*
   Global verbinden
*/


window.HalDoFiles =

HalDoFiles;





/*
   Verbindung mit System Manager
*/


if(window.HalDoSystem){


    HalDoSystem.registerModule(

        "Files",

        HalDoFiles

    );


}





HalDoFiles.start();





console.log(

"📁 HalDo Files Module v2.1 READY"

);