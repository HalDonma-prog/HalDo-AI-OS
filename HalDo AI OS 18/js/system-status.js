// ======================================
// HalDo AI OS 18
// System Status Center
// Version 18.0.0
// ======================================


const SystemStatus = {


    version: "18.0.0",


    status: {


        kernel: "starting",

        system: "starting",

        modules: "starting",

        updates: "starting"


    },



    setStatus(name, value){


        this.status[name] = value;


        console.log(
            "🟢",
            name,
            ":",
            value
        );


    },



    initialize(){


        console.log(
            "🔵 System Status Center gestartet"
        );


        this.setStatus(
            "kernel",
            "active"
        );


        this.setStatus(
            "system",
            "ready"
        );


        this.setStatus(
            "modules",
            "loaded"
        );


        this.setStatus(
            "updates",
            "ready"
        );


        this.show();


    },



    show(){


        console.log(
            "===================="
        );


        console.log(
            "🤖 HalDo AI OS 18"
        );


        console.log(
            "Version:",
            this.version
        );


        console.log(
            this.status
        );


        console.log(
            "===================="
        );


    }


};



SystemStatus.initialize();