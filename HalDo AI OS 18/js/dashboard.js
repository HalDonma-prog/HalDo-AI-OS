/*
========================================

HalDo AI OS 18
Dashboard Foundation

Version:
18.0.0

System Dashboard

========================================
*/


const HalDoDashboard = {


    version:
    "18.0.0",



    initialize(){


        console.log(
            "📊 Dashboard Foundation gestartet"
        );


        this.render();


    },



    render(){


        const dashboard =
        document.getElementById(
            "dashboard"
        );



        if(!dashboard){

            console.error(
                "Dashboard Bereich nicht gefunden"
            );

            return;

        }



        let system =
        "nicht verfügbar";


        let modules =
        "0";


        let ai =
        "offline";



        if(
            typeof HalDoSystem !== "undefined"
        ){

            system =
            HalDoSystem.state;

        }



        if(
            typeof ModuleManager !== "undefined"
        ){

            modules =
            ModuleManager.modules.length;

        }



        if(
            typeof AICore !== "undefined"
        ){

            ai =
            AICore.status;

        }



        dashboard.innerHTML = `


        <h2>
        🚀 HalDo AI OS 18 Dashboard
        </h2>


        <p>
        Version:
        ${this.version}
        </p>


        <p>
        🖥️ System:
        ${system}
        </p>


        <p>
        🧩 Module:
        ${modules}
        </p>


        <p>
        🤖 AI Core:
        ${ai}
        </p>


        `;


    }


};





// Dashboard starten

HalDoDashboard.initialize();