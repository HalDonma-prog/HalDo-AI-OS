/*
=====================================

HalDo AI OS 18
System Manager

Professional Ultimate Foundation

Version:
18.0.0

=====================================
*/


const HalDoSystem = {


    name:
    "HalDo AI OS 18",



    version:
    "18.0.0",



    edition:
    "Professional Ultimate Foundation",



    status:
    "online",



    startTime:
    new Date(),






    getTime:function(){


        return new Date()
        .toLocaleTimeString(
            "de-DE"
        );


    },







    getInfo:function(){


        return {


            name:this.name,


            version:this.version,


            edition:this.edition,


            status:this.status,


            time:this.getTime(),


            uptime:this.getUptime()



        };


    },








    getUptime:function(){


        let now =
        new Date();



        let seconds =
        Math.floor(
            (now - this.startTime)
            /1000
        );



        return seconds +
        " Sekunden";


    },








    setStatus:function(value){


        this.status =
        value;


    }






};








window.HalDoSystem =
HalDoSystem;







window.addEventListener(
"load",
function(){


console.log(
"🟢 HalDo System Manager geladen"
);



});