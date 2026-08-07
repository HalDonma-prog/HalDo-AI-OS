/*
========================================

HalDo AI OS 18
Extension Manager

Version:
18.0.0

System Extension Control

========================================
*/


const ExtensionManager = {


    name:
    "HalDo Extension Manager",


    version:
    "18.0.0",


    status:
    "offline",



    extensions:
    [],



    initialize(){


        console.log(
            "🔌 Extension Manager startet..."
        );


        this.status =
        "starting";


        this.loadDefaultExtensions();


    },



    loadDefaultExtensions(){


        this.extensions = [


            {


                name:
                "System Extension",


                version:
                "1.0.0",


                status:
                "ready"


            },


            {


                name:
                "AI Extension",


                version:
                "1.0.0",


                status:
                "ready"


            }


        ];



        this.status =
        "ready";



        console.log(
            "🔌 Erweiterungen geladen:",
            this.extensions
        );


    },



    installExtension(extension){


        this.extensions.push(
            extension
        );



        console.log(
            "➕ Erweiterung installiert:",
            extension.name
        );


    },



    removeExtension(name){


        this.extensions =
        this.extensions.filter(

            extension =>
            extension.name !== name

        );



        console.log(
            "🗑️ Erweiterung entfernt:",
            name
        );


    },



    enableExtension(name){


        const extension =
        this.getExtension(name);



        if(extension){


            extension.status =
            "active";



            console.log(
                "🟢 Erweiterung aktiviert:",
                name
            );


        }


    },



    disableExtension(name){


        const extension =
        this.getExtension(name);



        if(extension){


            extension.status =
            "disabled";



            console.log(
                "🔴 Erweiterung deaktiviert:",
                name
            );


        }


    },



    getExtension(name){


        return this.extensions.find(

            extension =>
            extension.name === name

        );


    },



    getExtensions(){


        return this.extensions;


    },



    getStatus(){


        return {


            name:
            this.name,


            version:
            this.version,


            status:
            this.status,


            extensions:
            this.extensions.length


        };


    }


};





ExtensionManager.initialize();



console.log(
    "🔌 HalDo Extension Manager geladen"
);