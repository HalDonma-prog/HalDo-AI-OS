/*
========================================

HalDo AI OS 18
System Status Center

Version:
18.0.0

System Monitoring Layer

========================================
*/


const SystemStatus = {


    name:
    "HalDo System Status Center",


    version:
    "18.0.0",


    status:
    "starting",


    systems:
    {},



    initialize(){


        console.log(
            "📊 System Status Center startet..."
        );


        this.status =
        "active";


        this.collect();


        this.display();



    },



    collect(){


        this.systems = {


            boot:
            typeof BootSystem !== "undefined"
            ?
            BootSystem.getStatus()
            :
            "offline",



            kernel:
            typeof Kernel !== "undefined"
            ?
            Kernel.getStatus()
            :
            "offline",



            engine:
            typeof HalDoEngine !== "undefined"
            ?
            HalDoEngine.getStatus()
            :
            "offline",



            system:
            typeof HalDoSystem !== "undefined"
            ?
            HalDoSystem.getStatus()
            :
            "offline",



            modules:
            typeof ModuleManager !== "undefined"
            ?
            ModuleManager.getStatus()
            :
            "offline",



            services:
            typeof ServiceManager !== "undefined"
            ?
            ServiceManager.getStatus()
            :
            "offline",



            updates:
            typeof UpdateManager !== "undefined"
            ?
            UpdateManager.getStatus()
            :
            "offline"


        };



        console.log(
            "📊 System Daten gesammelt",
            this.systems
        );


    },



    display(){


        const area =
        document.getElementById(
            "system-status"
        );



        if(
            !area
        ){

            return;

        }



        area.innerHTML = `


        <h2>
        📊 HalDo AI OS 18 Status
        </h2>


        <p>
        🧠 Kernel:
        ${this.read(
            this.systems.kernel
        )}
        </p>


        <p>
        ⚙️ Engine:
        ${this.read(
            this.systems.engine
        )}
        </p>


        <p>
        🖥️ System:
        ${this.read(
            this.systems.system
        )}
        </p>


        <p>
        🧩 Module:
        ${this.read(
            this.systems.modules
        )}
        </p>


        <p>
        🔄 Updates:
        ${this.read(
            this.systems.updates
        )}
        </p>


        `;


    },



    read(data){


        if(
            typeof data === "string"
        ){

            return data;


        }


        return data.status
        ||
        data.state
        ||
        "unknown";


    },



    refresh(){


        this.collect();

        this.display();


    },



    getStatus(){


        return {


            name:
            this.name,


            version:
            this.version,


            status:
            this.status,


            systems:
            this.systems


        };


    }


};





// Status Center starten

SystemStatus.initialize();