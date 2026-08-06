// ========================================
// HalDo AI OS 16
// Kernel
// ========================================


const HalDoKernel = {


    boot(){


        console.log(

            "🤖 HalDo AI OS Kernel startet..."

        );



        this.loadApps();



        if(window.HalDoSystem){


            HalDoSystem.start();


        }


    },



    loadApps(){



        if(window.HalDoAppManager){



            HalDoAppManager.register(

                "dashboard",

                {

                    name:

                    "Dashboard",

                    type:

                    "system"

                }

            );



            HalDoAppManager.register(

                "ai-chat",

                {

                    name:

                    "KI Chat",

                    type:

                    "ai"

                }

            );



            HalDoAppManager.register(

                "settings",

                {

                    name:

                    "Einstellungen",

                    type:

                    "system"

                }

            );



        }



    }



};



window.HalDoKernel = HalDoKernel;



window.addEventListener(

"DOMContentLoaded",

()=>{


    HalDoKernel.boot();


});