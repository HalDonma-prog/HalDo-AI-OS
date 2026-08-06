// ==========================================
// HalDo AI OS System Core
// Version 16.0
// ==========================================

const HalDoSystem = {

    name: "HalDo AI OS",

    version: "16.0",

    status: "running",


    start() {

        console.log(
            this.name +
            " gestartet Version " +
            this.version
        );

    },


    info() {

        return {

            name: this.name,

            version: this.version,

            status: this.status

        };

    }


};


window.HalDoSystem = HalDoSystem;