/*
========================================

HalDo AI OS 18
Main Menu Controller

Version:
18.0.0

User Control Layer

========================================
*/


const MainMenu = {


    name:
    "HalDo Main Menu",


    version:
    "18.0.0",


    status:
    "offline",



    initialize(){


        console.log(
            "🚀 Main Menu Initialisierung..."
        );


        this.status =
        "active";


        this.connect();


    },



    connect(){


        console.log(
            "🔗 Menü Verbindungen werden geprüft..."
        );



        const systems = {


            dashboard:
            typeof Dashboard !== "undefined",


            ai:
            typeof AICore !== "undefined",


            modules:
            typeof ModuleManager !== "undefined",


            status:
            typeof SystemStatus !== "undefined",


            security:
            typeof Security !== "undefined",


            database:
            typeof Database !== "undefined"


        };



        console.log(
            "🔗 Menü Systeme:",
            systems
        );



    },



    openDashboard(){


        console.log(
            "📊 Dashboard geöffnet"
        );



        if(
            typeof Dashboard !== "undefined"
        ){

            Dashboard.refresh();

        }



    },



    openAI(){


        console.log(
            "🤖 AI System geöffnet"
        );



        if(
            typeof AICore !== "undefined"
        ){

            AICore.process(
                "AI Menü geöffnet"
            );

        }



    },



    openModules(){


        console.log(
            "🧩 Module geöffnet"
        );



        if(
            typeof ModuleManager !== "undefined"
        ){

            console.log(
                ModuleManager.getModules()
            );

        }



    },



    openApps(){


        console.log(
            "📱 Apps Bereich geöffnet"
        );



        const area =
        document.getElementById(
            "app-container"
        );



        if(area){

            area.innerHTML = `

            <h3>
            📱 App System
            </h3>

            <p>
            App Manager wird vorbereitet...
            </p>

            `;

        }


    },



    openSettings(){


        console.log(
            "⚙️ Einstellungen geöffnet"
        );



        if(
            typeof Database !== "undefined"
        ){

            Database.set(
                "lastPage",
                "settings"
            );

        }


    },



    showSystemStatus(){


        console.log(
            "📡 System Status"
        );



        if(
            typeof SystemStatus !== "undefined"
        ){

            SystemStatus.refresh();

        }


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





// Globale Button Verbindungen


function openDashboard(){

    MainMenu.openDashboard();

}



function openAI(){

    MainMenu.openAI();

}



function openModules(){

    MainMenu.openModules();

}



function openApps(){

    MainMenu.openApps();

}



function openSettings(){

    MainMenu.openSettings();

}



function showSystemStatus(){

    MainMenu.showSystemStatus();

}





// Menü starten

MainMenu.initialize();