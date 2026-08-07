/*
========================================

HalDo AI OS 18
System Status Center

Version:
18.0.0

System Monitoring

========================================
*/


const SystemStatus = {


    name:
    "HalDo AI OS Status Center",


    version:
    "18.0.0",



    initialize(){


        console.log(
            "📊 System Status Center gestartet"
        );


        this.update();


    },



    update(){


        const kernel =
        this.getKernelStatus();


        const system =
        this.getSystemStatus();


        const modules =
        this.getModuleStatus();


        const updates =
        this.getUpdateStatus();



        this.render({

            kernel,
            system,
            modules,
            updates

        });



    },



    getKernelStatus(){


        if(
            typeof HalDoKernel !== "undefined"
        ){

            return "🟢 Aktiv";

        }


        return "🔴 Nicht geladen";


    },



    getSystemStatus(){


        if(
            typeof HalDoSystem !== "undefined"
        ){

            return HalDoSystem.state;

        }


        return "unknown";


    },



    getModuleStatus(){


        if(
            typeof ModuleManager !== "undefined"
        ){

            return ModuleManager.modules.length
            + " Module";

        }


        return "0 Module";


    },



    getUpdateStatus(){


        if(
            typeof UpdateManager !== "undefined"
        ){

            return UpdateManager.status;

        }


        return "unknown";


    },



    render(data){


        const box =
        document.getElementById(
            "system-status"
        );



        if(box){


            box.innerHTML = `


            <h2>
            📊 System Status
            </h2>


            <p>
            ⚙️ Kernel:
            ${data.kernel}
            </p>


            <p>
            🖥️ System:
            ${data.system}
            </p>


            <p>
            🧩 Module:
            ${data.modules}
            </p>


            <p>
            🔄 Updates:
            ${data.updates}
            </p>


            <p>
            Version:
            ${this.version}
            </p>


            `;


        }



        console.log(
            "📊 Status aktualisiert",
            data
        );


    }


};





// Status Center starten

SystemStatus.initialize();