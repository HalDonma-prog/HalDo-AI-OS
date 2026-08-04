/* =====================================
   HALDO AI OS
   MASTER CORE SCRIPT v2.1
   CLEAN FOUNDATION
===================================== */


document.addEventListener(
    "DOMContentLoaded",
    () => {

        console.log(
            "💙 HalDo AI OS Master Core gestartet"
        );


        window.HalDoCore = {

            name: "HalDo AI OS",

            version: "2.1",

            status: "online",

            mode: "MASTER FOUNDATION"

        };


        console.log(
            window.HalDoCore
        );


    }
);





/* =====================================
   STORAGE SYSTEM
===================================== */


window.HalDoStorage = {


    save(key, value){

        localStorage.setItem(

            "haldo_" + key,

            JSON.stringify(value)

        );

    },


    load(key){

        const data =
        localStorage.getItem(
            "haldo_" + key
        );


        if(!data){

            return null;

        }


        return JSON.parse(data);

    },


    remove(key){

        localStorage.removeItem(
            "haldo_" + key
        );

    }


};





/* =====================================
   NOTIFICATION SYSTEM
===================================== */


window.HalDoNotify = function(message){


    console.log(
        "🔔 HalDo:",
        message
    );


};





/* =====================================
   BASIC AI CORE
===================================== */


window.HalDoAI = {


    reply(message){


        const text =
        message.toLowerCase();



        if(
            text.includes("hallo") ||
            text.includes("hi")
        ){

            return "👋 Hallo! Ich bin HalDo AI.";

        }



        if(
            text.includes("name")
        ){

            return "🤖 Ich bin HalDo AI OS.";

        }



        if(
            text.includes("hilfe")
        ){

            return "⚙️ HalDo AI wird Schritt für Schritt erweitert.";

        }



        return "🧠 Nachricht erhalten. Mein System wird weiterentwickelt.";

    }


};





/* =====================================
   SYSTEM MANAGER BASIS
===================================== */


window.HalDoSystem = {


    ready:false,


    modules:{},



    registerModule(name,module){


        this.modules[name] = module;


        console.log(

            "⚙️ Modul registriert:",

            name

        );


    },



    start(){


        this.ready = true;


        return {

            status:"READY",

            modules:this.modules

        };


    }


};





console.log(

    "🚀 HalDo AI OS Core v2.1 READY"

);