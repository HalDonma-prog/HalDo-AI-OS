/*
========================================

HalDo AI OS 18
Dashboard Foundation

Version:
18.0.0

User Interface Layer

========================================
*/


const Dashboard = {


    name:
    "HalDo Dashboard",


    version:
    "18.0.0",


    status:
    "starting",



    initialize(){


        console.log(
            "📱 Dashboard Initialisierung..."
        );


        this.status =
        "active";


        this.render();


    },



    render(){


        const dashboard =
        document.getElementById(
            "dashboard"
        );



        if(
            !dashboard
        ){

            console.warn(
                "Dashboard Bereich nicht gefunden"
            );


            return;

        }



        dashboard.innerHTML = `


        <h2>
        🤖 HalDo AI OS 18 Dashboard
        </h2>


        <p>
        Version: ${this.version}
        </p>


        <p>
        Status:
        🟢 ${this.status}
        </p>


        <hr>


        <h3>
        System Komponenten
        </h3>


        <div id="component-list">

        Wird geladen...

        </div>


        `;



        this.showComponents();


    },



    showComponents(){


        const area =
        document.getElementById(
            "component-list"
        );



        if(
            !area
        ){

            return;

        }



        let content = "";



        if(
            typeof SystemStatus !== "undefined"
        ){


            const systems =
            SystemStatus.systems;



            content += `

            <p>
            🚀 Boot:
            ${this.getValue(
                systems.boot
            )}
            </p>


            <p>
            🧠 Kernel:
            ${this.getValue(
                systems.kernel
            )}
            </p>


            <p>
            ⚙️ Engine:
            ${this.getValue(
                systems.engine
            )}
            </p>


            <p>
            🧩 Module:
            ${this.getValue(
                systems.modules
            )}
            </p>


            <p>
            🔄 Updates:
            ${this.getValue(
                systems.updates
            )}
            </p>

            `;


        }
        else {


            content =
            "Status-System lädt...";


        }



        area.innerHTML =
        content;


    },



    getValue(data){


        if(
            typeof data === "string"
        ){

            return data;

        }



        return (
            data.status
            ||
            data.state
            ||
            "bereit"
        );


    },



    refresh(){


        if(
            typeof SystemStatus !== "undefined"
        ){

            SystemStatus.refresh();

        }


        this.showComponents();


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





// Dashboard starten

Dashboard.initialize();