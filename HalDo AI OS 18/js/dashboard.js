/*
========================================

HalDo AI OS 18
Dashboard Controller

Version:
18.0.0

Dashboard Management System

========================================
*/


const DashboardSystem = {


    name:
    "HalDo Dashboard",


    version:
    "18.0.0",


    status:
    "starting",



    initialize(){


        console.log(
            "📊 Dashboard startet..."
        );


        this.status =
        "active";


        this.render();


    },



    render(){


        const systemInfo =
        document.getElementById(
            "system-information"
        );



        if(systemInfo){


            let statusData =
            "Keine Daten verfügbar";



            if(
                typeof SystemStatus !== "undefined"
            ){


                statusData =
                JSON.stringify(
                    SystemStatus.data,
                    null,
                    2
                );


            }



            systemInfo.innerHTML = `

            <pre>
${statusData}
            </pre>

            `;


        }





        const moduleInfo =
        document.getElementById(
            "module-information"
        );



        if(moduleInfo){


            if(
                typeof ModuleManager !== "undefined"
            ){


                moduleInfo.innerHTML = `

                Module:
                ${ModuleManager.modules.length}

                <br><br>

                ${ModuleManager.modules
                .map(
                    module =>
                    "🧩 "
                    +
                    module.name
                    +
                    " - "
                    +
                    module.status
                )
                .join("<br>")}

                `;


            }
            else {


                moduleInfo.innerHTML =
                "Module System wartet...";


            }


        }



        const dashboardStatus =
        document.getElementById(
            "dashboard-status"
        );



        if(dashboardStatus){


            dashboardStatus.innerHTML =

            "🟢 Dashboard bereit";


        }



    },



    refresh(){


        this.render();


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





console.log(
    "📊 HalDo Dashboard geladen"
);





// Dashboard automatisch starten

window.addEventListener(
    "load",
    () => {


        DashboardSystem.initialize();


    }
);