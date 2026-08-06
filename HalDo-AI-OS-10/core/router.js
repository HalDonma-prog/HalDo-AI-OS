// ========================================
// HalDo AI OS 16
// Router System
// ========================================


const HalDoRouter = {


    apps:{


        dashboard:

        "apps/dashboard/index.html",


        ai-chat:

        "apps/ai-chat/index.html",


        settings:

        "apps/settings/index.html"


    },



    open(app){


        if(this.apps[app]){


            window.location.href = this.apps[app];


        }

        else {


            console.error(

                "App nicht gefunden:",

                app

            );


        }


    }


};



window.HalDoRouter = HalDoRouter;